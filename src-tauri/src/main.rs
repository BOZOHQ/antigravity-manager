// Prevents debug console window on Windows
#![windows_subsystem = "windows"]

mod proxy;

use proxy::{Account, AppState};
use std::sync::Arc;
use tauri::{AppHandle, Manager, State, Window};

// ==========================================
// Tauri IPC Commands
// ==========================================

#[tauri::command]
fn get_accounts(state: State<'_, Arc<AppState>>) -> Vec<Account> {
    state.accounts.read().clone()
}

#[tauri::command]
fn switch_account(id: String, state: State<'_, Arc<AppState>>) -> Result<String, String> {
    let mut accounts = state.accounts.write();
    let target = accounts.iter().position(|a| a.id == id);

    match target {
        Some(idx) => {
            for a in accounts.iter_mut() {
                a.is_active = false;
            }
            accounts[idx].is_active = true;
            accounts[idx].last_used = "Just now (Hot-Swapped)".to_string();
            Ok(accounts[idx].email.clone())
        }
        None => Err("Account not found".to_string()),
    }
}

#[tauri::command]
async fn toggle_proxy(state: State<'_, Arc<AppState>>) -> Result<bool, String> {
    let mut shutdown_lock = state.proxy_shutdown_tx.write();

    if let Some(tx) = shutdown_lock.take() {
        // Proxy is running, stop it
        let _ = tx.send(());
        Ok(false)
    } else {
        // Proxy is stopped, start it
        let state_clone = Arc::clone(&state);
        std::thread::spawn(move || {
            if let Ok(rt) = tokio::runtime::Runtime::new() {
                let _ = rt.block_on(proxy::start_proxy_server(state_clone));
            }
        });
        Ok(true)
    }
}

#[tauri::command]
fn sync_from_ide(state: State<'_, Arc<AppState>>) -> Vec<Account> {
    let mut accounts = state.accounts.write();
    let new_id = format!("acc_0{}", accounts.len() + 1);
    
    let synced_acc = Account {
        id: new_id,
        email: "cursor.workspace.ide@gmail.com".to_string(),
        avatar_color: "#c58af9".to_string(),
        initials: "CW".to_string(),
        provider: "GOOGLE".to_string(),
        is_active: false,
        last_used: "Just synced from IDE".to_string(),
        auth_token: "ya29.synced_ide_session_auth_token_9901".to_string(),
        gemini_quota: proxy::GeminiQuota {
            weekly: proxy::QuotaMetric {
                percentage: 98,
                resets_in: "6d 22h".to_string(),
            },
            five_hour: proxy::QuotaMetric {
                percentage: 100,
                resets_in: "Healthy".to_string(),
            },
        },
        claude_gpt_quota: proxy::ClaudeGptQuota {
            weekly: proxy::QuotaMetric {
                percentage: 90,
                resets_in: "5d 10h".to_string(),
            },
            five_hour: proxy::QuotaMetric {
                percentage: 95,
                resets_in: "Healthy".to_string(),
            },
        },
    };

    accounts.push(synced_acc);
    accounts.clone()
}

#[tauri::command]
fn simulate_usage(decrement: Option<u8>, state: State<'_, Arc<AppState>>) -> Result<u8, String> {
    let dec = decrement.unwrap_or(8);
    let mut accounts = state.accounts.write();
    let auto_switch = state.config.read().auto_switch_enabled;

    if let Some(active) = accounts.iter_mut().find(|a| a.is_active) {
        active.gemini_quota.five_hour.percentage = active.gemini_quota.five_hour.percentage.saturating_sub(dec);
        let current_percentage = active.gemini_quota.five_hour.percentage;

        if auto_switch && current_percentage <= 5 {
            // Hot swap trigger
            let best_idx = accounts
                .iter()
                .enumerate()
                .filter(|(_, a)| !a.is_active && a.gemini_quota.five_hour.percentage > 5)
                .max_by_key(|(_, a)| a.gemini_quota.five_hour.percentage)
                .map(|(i, _)| i);

            if let Some(idx) = best_idx {
                for a in accounts.iter_mut() {
                    a.is_active = false;
                }
                accounts[idx].is_active = true;
                accounts[idx].last_used = "Just now (Hot-Swapped)".to_string();
            }
        }

        Ok(current_percentage)
    } else {
        Err("No active account to simulate".to_string())
    }
}

#[tauri::command]
fn window_control(action: String, window: Window) -> Result<(), String> {
    match action.as_str() {
        "minimize" => window.minimize().map_err(|e| e.to_string()),
        "maximize" => {
            if window.is_maximized().unwrap_or(false) {
                window.unmaximize().map_err(|e| e.to_string())
            } else {
                window.maximize().map_err(|e| e.to_string())
            }
        }
        "close" => {
            // Close switcher without touching any other running application
            let _ = window.destroy();
            std::process::exit(0);
        }
        _ => Err("Invalid window action".to_string()),
    }
}

#[tauri::command]
fn open_browser(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("rundll32")
            .args(&["url.dll,FileProtocolHandler", &url])
            .spawn();
    }
    Ok(())
}

// ==========================================
// Application Bootstrap
// ==========================================

fn get_debug_log_path() -> std::path::PathBuf {
    if let Ok(app_data) = std::env::var("APPDATA") {
        let dir = std::path::PathBuf::from(app_data).join("AntigravityManager");
        let _ = std::fs::create_dir_all(&dir);
        return dir.join("debug.log");
    }
    std::path::PathBuf::from("debug.log")
}

fn log_debug(msg: &str) {
    let p = get_debug_log_path();
    if let Ok(mut f) = std::fs::OpenOptions::new().create(true).append(true).open(p) {
        use std::io::Write;
        let _ = writeln!(f, "[{}] {}", chrono::Utc::now(), msg);
    }
}

fn main() {
    std::panic::set_hook(Box::new(|panic_info| {
        log_debug(&format!("CRITICAL PANIC: {}", panic_info));
    }));

    tracing_subscriber::fmt::init();
    log_debug("Application booting");

    let app_state = Arc::new(AppState::new());
    let proxy_state = Arc::clone(&app_state);

    // Spawn Background Axum Proxy Service on dedicated Tokio Runtime
    std::thread::spawn(move || {
        log_debug("Spawning background proxy thread");
        if let Ok(rt) = tokio::runtime::Runtime::new() {
            log_debug("Tokio runtime created successfully");
            rt.block_on(async move {
                log_debug("Entering rt.block_on start_proxy_server");
                if let Err(e) = proxy::start_proxy_server(proxy_state).await {
                    log_debug(&format!("PROXY SERVER TERMINATED WITH ERROR: {:?}", e));
                } else {
                    log_debug("PROXY SERVER TERMINATED CLEANLY");
                }
            });
        } else {
            log_debug("FAILED TO CREATE TOKIO RUNTIME");
        }
    });

    log_debug("Starting tauri::Builder run");
    let res = tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            get_accounts,
            switch_account,
            toggle_proxy,
            sync_from_ide,
            simulate_usage,
            window_control,
            open_browser
        ])
        .run(tauri::generate_context!());

    match res {
        Ok(_) => log_debug("Tauri run completed cleanly (window closed)"),
        Err(e) => log_debug(&format!("TAURI RUN RETURNED ERROR: {:?}", e)),
    }
}
