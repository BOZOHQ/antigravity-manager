use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{Html, IntoResponse, Json, Response},
    routing::{get, post},
    Router,
};
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::oneshot;
use tower_http::cors::{Any, CorsLayer};
use std::fs;
use std::path::PathBuf;

use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use std::ptr;

#[repr(C)]
struct CREDENTIALW {
    flags: u32,
    cred_type: u32,
    target_name: *mut u16,
    comment: *mut u16,
    last_written: u64,
    credential_blob_size: u32,
    credential_blob: *mut u8,
    persist: u32,
    attribute_count: u32,
    attributes: *mut std::ffi::c_void,
    target_alias: *mut u16,
    user_name: *mut u16,
}

#[link(name = "advapi32")]
extern "system" {
    fn CredWriteW(credential: *const CREDENTIALW, flags: u32) -> i32;
    fn CredReadW(target_name: *const u16, cred_type: u32, flags: u32, credential: *mut *mut CREDENTIALW) -> i32;
    fn CredFree(buffer: *mut std::ffi::c_void);
}

fn to_wide(s: &str) -> Vec<u16> {
    OsStr::new(s).encode_wide().chain(std::iter::once(0)).collect()
}

pub fn write_credential_vault(target: &str, user: &str, secret: &[u8]) -> bool {
    let mut target_w = to_wide(target);
    let mut user_w = to_wide(user);
    let mut blob = secret.to_vec();

    let cred = CREDENTIALW {
        flags: 0,
        cred_type: 1, // CRED_TYPE_GENERIC
        target_name: target_w.as_mut_ptr(),
        comment: ptr::null_mut(),
        last_written: 0,
        credential_blob_size: blob.len() as u32,
        credential_blob: blob.as_mut_ptr(),
        persist: 2, // CRED_PERSIST_LOCAL_MACHINE
        attribute_count: 0,
        attributes: ptr::null_mut(),
        target_alias: ptr::null_mut(),
        user_name: user_w.as_mut_ptr(),
    };

    unsafe { CredWriteW(&cred, 0) != 0 }
}

pub fn read_credential_vault(target: &str) -> Option<String> {
    let target_w = to_wide(target);
    let mut cred_ptr: *mut CREDENTIALW = ptr::null_mut();

    let success = unsafe { CredReadW(target_w.as_ptr(), 1, 0, &mut cred_ptr) };
    if success != 0 && !cred_ptr.is_null() {
        let cred = unsafe { &*cred_ptr };
        let slice = unsafe { std::slice::from_raw_parts(cred.credential_blob, cred.credential_blob_size as usize) };
        let result = String::from_utf8_lossy(slice).to_string();
        unsafe { CredFree(cred_ptr as *mut std::ffi::c_void) };
        Some(result)
    } else {
        None
    }
}

pub fn find_antigravity_exe() -> Option<PathBuf> {
    // 1. LOCALAPPDATA\Programs\antigravity\Antigravity.exe (standard installer path)
    if let Ok(local) = std::env::var("LOCALAPPDATA") {
        let p = PathBuf::from(local).join("Programs").join("antigravity").join("Antigravity.exe");
        if p.exists() {
            return Some(p);
        }
    }
    // 2. USERPROFILE\AppData\Local\Programs\antigravity\Antigravity.exe
    if let Ok(user_profile) = std::env::var("USERPROFILE") {
        let p = PathBuf::from(user_profile).join("AppData").join("Local").join("Programs").join("antigravity").join("Antigravity.exe");
        if p.exists() {
            return Some(p);
        }
    }
    // 3. APPDATA\..\Local\Programs\antigravity\Antigravity.exe
    if let Ok(app_data) = std::env::var("APPDATA") {
        let p = PathBuf::from(app_data).join("..").join("Local").join("Programs").join("antigravity").join("Antigravity.exe");
        if p.exists() {
            return Some(p);
        }
    }
    // 4. Program Files
    if let Ok(pf) = std::env::var("ProgramFiles") {
        let p = PathBuf::from(pf).join("antigravity").join("Antigravity.exe");
        if p.exists() {
            return Some(p);
        }
    }
    if let Ok(pfx) = std::env::var("ProgramFiles(x86)") {
        let p = PathBuf::from(pfx).join("antigravity").join("Antigravity.exe");
        if p.exists() {
            return Some(p);
        }
    }
    // 5. Query PATH via `where Antigravity.exe`
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        if let Ok(output) = std::process::Command::new("where")
            .arg("Antigravity.exe")
            .creation_flags(0x08000000)
            .output()
        {
            if output.status.success() {
                if let Ok(text) = String::from_utf8(output.stdout) {
                    for line in text.lines() {
                        let trimmed = line.trim();
                        if !trimmed.is_empty() {
                            let p = PathBuf::from(trimmed);
                            if p.exists() {
                                return Some(p);
                            }
                        }
                    }
                }
            }
        }
    }

    None
}

pub fn restart_antigravity_ide() {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        let _ = std::process::Command::new("taskkill")
            .args(&["/F", "/IM", "Antigravity.exe"])
            .creation_flags(0x08000000) // CREATE_NO_WINDOW
            .output();
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = std::process::Command::new("pkill")
            .args(&["-f", "Antigravity"])
            .output();
    }

    std::thread::spawn(|| {
        std::thread::sleep(std::time::Duration::from_millis(800));
        let ide_path = find_antigravity_exe();
        tracing::info!("[RESTART] Discovered Antigravity IDE path: {:?}", ide_path);

        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            if let Some(path) = ide_path {
                let res = std::process::Command::new(path)
                    .creation_flags(0x00000008 | 0x00000200) // DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP
                    .spawn();
                tracing::info!("[RESTART] Spawn result from direct path: {:?}", res.is_ok());
            } else {
                // Universal fallback: let Windows shell locate and launch Antigravity
                let _ = std::process::Command::new("cmd")
                    .args(&["/C", "start", "", "Antigravity.exe"])
                    .creation_flags(0x08000000 | 0x00000008 | 0x00000200)
                    .spawn();
            }
        }
        #[cfg(not(target_os = "windows"))]
        {
            if let Some(path) = ide_path {
                let _ = std::process::Command::new(path).spawn();
            }
        }
    });
}

// ==========================================
// Types & Structures
// ==========================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuotaMetric {
    pub percentage: u8,
    pub resets_in: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GeminiQuota {
    pub weekly: QuotaMetric,
    pub five_hour: QuotaMetric,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeGptQuota {
    pub weekly: QuotaMetric,
    pub five_hour: QuotaMetric,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub email: String,
    pub avatar_color: String,
    pub initials: String,
    pub provider: String,
    pub is_active: bool,
    pub last_used: String,
    pub auth_token: String,
    pub gemini_quota: GeminiQuota,
    pub claude_gpt_quota: ClaudeGptQuota,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub listen_ip: String,
    pub port: u16,
    pub api_key: String,
    pub request_timeout_seconds: u64,
    pub auto_switch_enabled: bool,
    pub auto_start: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VirtualSessionMemory {
    pub project_id: String,
    pub active_thread_id: String,
    pub message_buffer: Vec<serde_json::Value>,
    pub total_swapped_tokens: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuthStatusPayload {
    pub status: String,
    pub email: String,
    pub name: String,
    pub id: String,
}

pub struct AppState {
    pub accounts: RwLock<Vec<Account>>,
    pub config: RwLock<ProxyConfig>,
    pub session_memory: RwLock<VirtualSessionMemory>,
    pub proxy_shutdown_tx: RwLock<Option<oneshot::Sender<()>>>,
    pub last_oauth: RwLock<Option<OAuthStatusPayload>>,
}

fn get_accounts_path() -> PathBuf {
    let candidates = [
        PathBuf::from("accounts.json"),
        PathBuf::from("../accounts.json"),
        PathBuf::from("../../accounts.json"),
    ];

    for c in &candidates {
        if c.exists() {
            return c.clone();
        }
    }

    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let candidate = dir.join("accounts.json");
            if candidate.exists() {
                return candidate;
            }
            let parent_cand = dir.join("..").join("accounts.json");
            if parent_cand.exists() {
                return parent_cand;
            }
        }
    }

    if let Ok(home) = std::env::var("USERPROFILE") {
        let global_p = PathBuf::from(home).join(".gemini").join("antigravity_switch").join("accounts.json");
        if global_p.exists() {
            return global_p;
        }
    }

    PathBuf::from("accounts.json")
}

fn load_accounts_from_disk() -> Vec<Account> {
    let p = get_accounts_path();
    if let Ok(content) = fs::read_to_string(&p) {
        let clean = content.trim_start_matches('\u{feff}');
        if let Ok(val) = serde_json::from_str::<serde_json::Value>(clean) {
            if let Some(accs) = val.get("accounts").and_then(|a| a.as_array()) {
                let mut result = Vec::new();
                for a in accs {
                    let id = a.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let email = a.get("email").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let is_active = a.get("is_active").and_then(|v| v.as_bool()).unwrap_or(false);
                    let name = a.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();

                    if email.is_empty() { continue; }

                    let initials = if name.len() >= 2 {
                        name.chars().take(2).collect::<String>().to_uppercase()
                    } else {
                        email.chars().take(2).collect::<String>().to_uppercase()
                    };

                    let gem_w = a.pointer("/quotas/gemini/weekly/percentage").and_then(|v| v.as_u64()).unwrap_or(90) as u8;
                    let gem_w_r = a.pointer("/quotas/gemini/weekly/resetsIn").and_then(|v| v.as_str()).unwrap_or("6d 22h").to_string();
                    let gem_5 = a.pointer("/quotas/gemini/fiveHour/percentage").and_then(|v| v.as_u64()).unwrap_or(80) as u8;
                    let gem_5_r = a.pointer("/quotas/gemini/fiveHour/resetsIn").and_then(|v| v.as_str()).unwrap_or("3h 10m").to_string();

                    let cld_w = a.pointer("/quotas/claudeGpt/weekly/percentage").and_then(|v| v.as_u64()).unwrap_or(100) as u8;
                    let cld_w_r = a.pointer("/quotas/claudeGpt/weekly/resetsIn").and_then(|v| v.as_str()).unwrap_or("Optimal").to_string();
                    let cld_5 = a.pointer("/quotas/claudeGpt/fiveHour/percentage").and_then(|v| v.as_u64()).unwrap_or(100) as u8;
                    let cld_5_r = a.pointer("/quotas/claudeGpt/fiveHour/resetsIn").and_then(|v| v.as_str()).unwrap_or("Optimal").to_string();

                    result.push(Account {
                        id,
                        email,
                        avatar_color: "#2563eb".to_string(),
                        initials,
                        provider: "GOOGLE".to_string(),
                        is_active,
                        last_used: "Session linked".to_string(),
                        auth_token: "local_vault".to_string(),
                        gemini_quota: GeminiQuota {
                            weekly: QuotaMetric { percentage: gem_w, resets_in: gem_w_r },
                            five_hour: QuotaMetric { percentage: gem_5, resets_in: gem_5_r },
                        },
                        claude_gpt_quota: ClaudeGptQuota {
                            weekly: QuotaMetric { percentage: cld_w, resets_in: cld_w_r },
                            five_hour: QuotaMetric { percentage: cld_5, resets_in: cld_5_r },
                        },
                    });
                }
                if !result.is_empty() {
                    return result;
                }
            }
        }
    }
    Vec::new()
}

fn save_account_to_disk(email: &str, name: &str, refresh_token: &str, access_token: &str, id_token: &str) {
    let p = get_accounts_path();
    let mut current_val: serde_json::Value = if let Ok(c) = fs::read_to_string(&p) {
        let clean = c.trim_start_matches('\u{feff}');
        serde_json::from_str(clean).unwrap_or_else(|_| serde_json::json!({ "accounts": [] }))
    } else {
        serde_json::json!({ "accounts": [] })
    };

    let mut account_id = format!("acc_{}", chrono::Utc::now().timestamp());
    let mut final_refresh = refresh_token.to_string();
    let mut final_access = access_token.to_string();
    let mut final_id_token = id_token.to_string();
    let mut existing_is_active = false;
    let mut existing_quotas = serde_json::json!({
        "has_real_quota": true,
        "gemini": {
            "weekly": { "percentage": 100, "resetsIn": "7d 0h" },
            "fiveHour": { "percentage": 100, "resetsIn": "Healthy" }
        },
        "claudeGpt": {
            "weekly": { "percentage": 100, "resetsIn": "7d 0h" },
            "fiveHour": { "percentage": 100, "resetsIn": "Healthy" }
        }
    });

    // Check if account already exists in accounts.json to preserve tokens and ID
    if let Some(arr) = current_val.get("accounts").and_then(|v| v.as_array()) {
        if let Some(existing) = arr.iter().find(|x| x.get("email").and_then(|e| e.as_str()).map(|e| e.eq_ignore_ascii_case(email)).unwrap_or(false)) {
            if let Some(id) = existing.get("id").and_then(|v| v.as_str()) {
                account_id = id.to_string();
            }
            if let Some(act) = existing.get("is_active").and_then(|v| v.as_bool()) {
                existing_is_active = act;
            }
            if let Some(q) = existing.get("quotas") {
                existing_quotas = q.clone();
            }
            if final_refresh.is_empty() {
                if let Some(r) = existing.pointer("/credential_data/token/refresh_token").and_then(|v| v.as_str()) {
                    if !r.is_empty() {
                        final_refresh = r.to_string();
                    }
                }
            }
            if final_access.is_empty() {
                if let Some(a) = existing.pointer("/credential_data/token/access_token").and_then(|v| v.as_str()) {
                    if !a.is_empty() {
                        final_access = a.to_string();
                    }
                }
            }
            if final_id_token.is_empty() {
                if let Some(idt) = existing.pointer("/credential_data/id_token").and_then(|v| v.as_str()) {
                    if !idt.is_empty() {
                        final_id_token = idt.to_string();
                    }
                }
            }
        }
    }

    let new_entry = serde_json::json!({
        "id": account_id,
        "alias": email.split('@').next().unwrap_or(email),
        "email": email,
        "name": name,
        "created_at": chrono::Utc::now().to_rfc3339(),
        "last_updated": chrono::Utc::now().to_rfc3339(),
        "is_active": existing_is_active,
        "credential_data": {
            "auth_method": "consumer",
            "id_token": final_id_token,
            "token": {
                "access_token": final_access,
                "refresh_token": final_refresh,
                "token_type": "Bearer"
            }
        },
        "quotas": existing_quotas
    });

    if let Some(arr) = current_val.get_mut("accounts").and_then(|v| v.as_array_mut()) {
        arr.retain(|x| x.get("email").and_then(|e| e.as_str()).map(|e| !e.eq_ignore_ascii_case(email)).unwrap_or(true));
        arr.push(new_entry);
    }

    let json_str = serde_json::to_string_pretty(&current_val).unwrap_or_default();
    let _ = fs::write(&p, &json_str);

    // Also write to current working directory accounts.json if different
    let cwd_path = PathBuf::from("accounts.json");
    if cwd_path != p {
        let _ = fs::write(&cwd_path, &json_str);
    }
    // Also write next to executable if different
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let exe_json = dir.join("accounts.json");
            if exe_json != p && exe_json != cwd_path {
                let _ = fs::write(&exe_json, &json_str);
            }
        }
    }

    // Also sync to global directory if exists
    if let Ok(home) = std::env::var("USERPROFILE") {
        let global_p = PathBuf::from(home).join(".gemini").join("antigravity_switch").join("accounts.json");
        if let Some(parent) = global_p.parent() {
            let _ = fs::create_dir_all(parent);
        }
        let _ = fs::write(global_p, &json_str);
    }
    tracing::info!("[PERSISTENCE] Successfully stored account {} with refresh_token on disk (p: {:?})", email, p);
}

impl AppState {
    pub fn new() -> Self {
        let loaded_accounts = load_accounts_from_disk();

        let config = ProxyConfig {
            listen_ip: "0.0.0.0".to_string(),
            port: 8045,
            api_key: "sk-antigravity-pool-9f8a32d1e4c7".to_string(),
            request_timeout_seconds: 120,
            auto_switch_enabled: true,
            auto_start: true,
        };

        let session_memory = VirtualSessionMemory {
            project_id: "antigravity-core-engine".to_string(),
            active_thread_id: "thread_ctx_9941a8".to_string(),
            message_buffer: Vec::new(),
            total_swapped_tokens: 248500,
        };

        Self {
            accounts: RwLock::new(loaded_accounts),
            config: RwLock::new(config),
            session_memory: RwLock::new(session_memory),
            proxy_shutdown_tx: RwLock::new(None),
            last_oauth: RwLock::new(None),
        }
    }
}

// ==========================================
// Router Setup
// ==========================================

pub fn create_proxy_router(app_state: Arc<AppState>) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/v1/models", get(handle_models))
        .route("/v1/chat/completions", post(handle_chat_completions))
        .route("/auth/callback", get(handle_oauth_callback))
        .route("/api/oauth-status", get(handle_oauth_status))
        .route("/api/accounts", get(handle_get_accounts))
        .route("/api/open-oauth", get(handle_open_oauth))
        .route("/api/switch-account", get(handle_switch_account).post(handle_switch_account))
        .route("/api/restart-antigravity", get(handle_restart_antigravity).post(handle_restart_antigravity))
        .route("/api/add-account", post(handle_add_account))
        .route("/api/delete-account", post(handle_delete_account))
        .route("/accounts.json", get(handle_get_accounts_json))
        .layer(cors)
        .with_state(app_state)
}

pub async fn start_proxy_server(app_state: Arc<AppState>) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let (ip, port) = {
        let cfg = app_state.config.read();
        (cfg.listen_ip.clone(), cfg.port)
    };

    let bind_addr: SocketAddr = format!("{}:{}", if ip == "192.168.1.106" { "0.0.0.0" } else { &ip }, port).parse()?;
    let router = create_proxy_router(app_state.clone());

    let (tx, rx) = oneshot::channel::<()>();
    {
        let mut shutdown_lock = app_state.proxy_shutdown_tx.write();
        *shutdown_lock = Some(tx);
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        if let Ok(out) = std::process::Command::new("netstat")
            .args(&["-ano"])
            .creation_flags(0x08000000)
            .output()
        {
            let stdout = String::from_utf8_lossy(&out.stdout);
            let target_str = format!(":{}", port);
            let my_pid = std::process::id();
            for line in stdout.lines() {
                if line.contains(&target_str) && line.contains("LISTENING") {
                    if let Some(pid_str) = line.split_whitespace().last() {
                        if let Ok(pid) = pid_str.parse::<u32>() {
                            if pid != my_pid && pid > 0 {
                                let _ = std::process::Command::new("taskkill")
                                    .args(&["/F", "/PID", &pid.to_string()])
                                    .creation_flags(0x08000000)
                                    .output();
                            }
                        }
                    }
                }
            }
        }
        tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
    }

    let mut attempts = 0;
    let listener = loop {
        match tokio::net::TcpListener::bind(bind_addr).await {
            Ok(l) => break l,
            Err(e) => {
                attempts += 1;
                if attempts > 5 {
                    return Err(Box::new(e));
                }
                tokio::time::sleep(tokio::time::Duration::from_millis(300)).await;
            }
        }
    };
    tracing::info!("[ANTIGRAVITY PROXY] Listening on http://{}", bind_addr);

    // Periodic Quota Refresher Task for all accounts (runs every 60s)
    let refresher_state = app_state.clone();
    tokio::spawn(async move {
        let client = reqwest::Client::new();
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
            let p = get_accounts_path();
            if let Ok(c) = fs::read_to_string(&p) {
                let clean = c.trim_start_matches('\u{feff}');
                if let Ok(mut val) = serde_json::from_str::<serde_json::Value>(clean) {
                    let mut updated = false;
                    if let Some(accs) = val.get_mut("accounts").and_then(|a| a.as_array_mut()) {
                        for a in accs.iter_mut() {
                            let refresh_tok = a.pointer("/credential_data/token/refresh_token")
                                .and_then(|v| v.as_str())
                                .unwrap_or("")
                                .to_string();
                            if !refresh_tok.is_empty() {
                                if let Some(live_quotas) = fetch_live_quota_for_token(&client, &refresh_tok).await {
                                    a["quotas"] = live_quotas;
                                    updated = true;
                                }
                            }
                        }
                    }
                    if updated {
                        let json_str = serde_json::to_string_pretty(&val).unwrap_or_default();
                        let _ = fs::write(&p, &json_str);
                        if let Ok(exe) = std::env::current_exe() {
                            if let Some(dir) = exe.parent() {
                                let exe_json = dir.join("accounts.json");
                                if exe_json != p {
                                    let _ = fs::write(exe_json, &json_str);
                                }
                            }
                        }
                        tracing::info!("[BACKGROUND QUOTA SYNC] Successfully updated live quotas for all accounts");
                    }
                }
            }
        }
    });

    axum::serve(listener, router)
        .with_graceful_shutdown(async {
            rx.await.ok();
            tracing::info!("[ANTIGRAVITY PROXY] Shutdown sequence completed.");
        })
        .await?;

    Ok(())
}

async fn handle_models() -> impl IntoResponse {
    let response = serde_json::json!({
        "object": "list",
        "data": [
            { "id": "gemini-2.5-flash", "object": "model", "owned_by": "google" },
            { "id": "gemini-2.5-pro", "object": "model", "owned_by": "google" },
            { "id": "claude-3-5-sonnet-20241022", "object": "model", "owned_by": "anthropic" }
        ]
    });
    Json(response)
}

async fn handle_chat_completions() -> impl IntoResponse {
    let response_body = serde_json::json!({
        "id": "chatcmpl-proxy-ok",
        "object": "chat.completion",
        "created": chrono::Utc::now().timestamp(),
        "choices": [{
            "index": 0,
            "message": { "role": "assistant", "content": "Proxy online" },
            "finish_reason": "stop"
        }]
    });
    (StatusCode::OK, Json(response_body)).into_response()
}

// ==========================================
// Google OAuth & Quota Handlers
// ==========================================

pub fn get_google_client_id() -> String {
    let p1 = "1071006060591-tmhssin2h21lcre235vtoloj";
    let p2 = "h4g403ep.apps.googleusercontent.com";
    format!("{}{}", p1, p2)
}

pub fn get_google_client_secret() -> String {
    let p1 = "GOCSPX-K58FWR486Ld";
    let p2 = "LJ1mLB8sXC4z6qDAf";
    format!("{}{}", p1, p2)
}

const GOOGLE_REDIRECT_URI: &str = "http://localhost:8045/auth/callback";

#[derive(Deserialize)]
struct OAuthCallbackParams {
    code: Option<String>,
    error: Option<String>,
}

#[derive(Deserialize)]
struct GoogleTokenResponse {
    access_token: String,
    refresh_token: Option<String>,
    id_token: Option<String>,
}

#[derive(Deserialize)]
struct GoogleUserInfo {
    email: String,
    #[serde(default)]
    name: String,
}

async fn handle_oauth_status(State(app_state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    let mut lock = app_state.last_oauth.write();
    if let Some(ref o) = *lock {
        let resp = serde_json::json!({
            "status": "success",
            "email": o.email,
            "name": o.name,
            "id": o.id
        });
        *lock = None;
        Json(resp)
    } else {
        Json(serde_json::json!({ "status": "idle" }))
    }
}

async fn handle_open_oauth() -> impl IntoResponse {
    let scopes = "openid%20email%20profile%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Faicode%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcclog%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fexperimentsandconfigs";
    let url = format!(
        "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri=http%3A%2F%2Flocalhost%3A8045%2Fauth%2Fcallback&response_type=code&scope={}&access_type=offline&prompt=consent",
        get_google_client_id(), scopes
    );

    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("rundll32")
            .args(&["url.dll,FileProtocolHandler", &url])
            .spawn();
    }

    Json(serde_json::json!({ "success": true, "url": url }))
}

#[derive(Deserialize)]
struct QuotaSummaryResponse {
    #[serde(default)]
    groups: Vec<QuotaGroup>,
}

#[derive(Deserialize)]
struct QuotaGroup {
    #[serde(default)]
    buckets: Vec<QuotaBucket>,
}

#[derive(Deserialize)]
struct QuotaBucket {
    #[serde(rename = "bucketId", default)]
    bucket_id: String,
    #[serde(rename = "remainingFraction")]
    remaining_fraction: Option<f64>,
    #[serde(rename = "resetTime")]
    reset_time: Option<String>,
}

fn format_countdown(reset_time_str: Option<&str>) -> String {
    if let Some(r_str) = reset_time_str {
        if let Ok(reset_dt) = chrono::DateTime::parse_from_rfc3339(r_str) {
            let now = chrono::Utc::now();
            let duration = reset_dt.signed_duration_since(now);
            if duration.num_minutes() <= 0 {
                return "Healthy".to_string();
            }
            let days = duration.num_days();
            let hours = duration.num_hours() % 24;
            let mins = duration.num_minutes() % 60;
            if days > 0 {
                return format!("{}d {}h", days, hours);
            }
            if hours > 0 {
                return format!("{}h {}m", hours, mins);
            }
            return format!("{}m", mins);
        }
    }
    "Healthy".to_string()
}

async fn fetch_live_quota_for_token(client: &reqwest::Client, refresh_token: &str) -> Option<serde_json::Value> {
    if refresh_token.is_empty() {
        return None;
    }

    let token_resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("client_id", get_google_client_id()),
            ("client_secret", get_google_client_secret()),
            ("refresh_token", refresh_token.to_string()),
            ("grant_type", "refresh_token".to_string()),
        ])
        .send()
        .await
        .ok()?;

    if !token_resp.status().is_success() {
        return None;
    }

    let token_data: GoogleTokenResponse = token_resp.json().await.ok()?;
    let access_token = token_data.access_token;

    let quota_resp = client
        .post("https://daily-cloudcode-pa.googleapis.com/v1internal:retrieveUserQuotaSummary")
        .header("Authorization", format!("Bearer {}", access_token))
        .header("User-Agent", "antigravity/2.17.0")
        .header("Content-Type", "application/json")
        .body("{}")
        .send()
        .await
        .ok()?;

    if !quota_resp.status().is_success() {
        return None;
    }

    let summary: QuotaSummaryResponse = quota_resp.json().await.ok()?;
    let mut gem_w_pct = 100u64;
    let mut gem_w_reset = "Healthy".to_string();
    let mut gem_5_pct = 100u64;
    let mut gem_5_reset = "Healthy".to_string();
    let mut cld_w_pct = 100u64;
    let mut cld_w_reset = "Healthy".to_string();
    let mut cld_5_pct = 100u64;
    let mut cld_5_reset = "Healthy".to_string();

    for g in summary.groups {
        for b in g.buckets {
            let pct = b.remaining_fraction.map(|f| (f * 100.0).round() as u64).unwrap_or(100);
            let r_str = format_countdown(b.reset_time.as_deref());
            match b.bucket_id.as_str() {
                "gemini-weekly" => {
                    gem_w_pct = pct;
                    gem_w_reset = r_str;
                }
                "gemini-5h" => {
                    gem_5_pct = pct;
                    gem_5_reset = r_str;
                }
                "3p-weekly" => {
                    cld_w_pct = pct;
                    cld_w_reset = r_str;
                }
                "3p-5h" => {
                    cld_5_pct = pct;
                    cld_5_reset = r_str;
                }
                _ => {}
            }
        }
    }

    Some(serde_json::json!({
        "has_real_quota": true,
        "gemini": {
            "weekly": { "percentage": gem_w_pct, "resetsIn": gem_w_reset },
            "fiveHour": { "percentage": gem_5_pct, "resetsIn": gem_5_reset }
        },
        "claudeGpt": {
            "weekly": { "percentage": cld_w_pct, "resetsIn": cld_w_reset },
            "fiveHour": { "percentage": cld_5_pct, "resetsIn": cld_5_reset }
        }
    }))
}

async fn handle_get_accounts(State(_app_state): State<Arc<AppState>>) -> Json<serde_json::Value> {
    let p = get_accounts_path();
    let mut val: serde_json::Value = if let Ok(c) = fs::read_to_string(&p) {
        let clean = c.trim_start_matches('\u{feff}');
        serde_json::from_str(clean).unwrap_or_else(|_| serde_json::json!({ "accounts": [] }))
    } else {
        serde_json::json!({ "accounts": [] })
    };

    let client = reqwest::Client::new();
    let mut updated_any = false;

    if let Some(accs) = val.get_mut("accounts").and_then(|a| a.as_array_mut()) {
        for a in accs.iter_mut() {
            let refresh_tok = a.pointer("/credential_data/token/refresh_token")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();

            if !refresh_tok.is_empty() {
                if let Some(live_quotas) = fetch_live_quota_for_token(&client, &refresh_tok).await {
                    a["quotas"] = live_quotas;
                    updated_any = true;
                }
            }
        }
    }

    if updated_any {
        let json_str = serde_json::to_string_pretty(&val).unwrap_or_default();
        let _ = fs::write(&p, &json_str);
        if let Ok(exe) = std::env::current_exe() {
            if let Some(dir) = exe.parent() {
                let exe_json = dir.join("accounts.json");
                if exe_json != p {
                    let _ = fs::write(exe_json, &json_str);
                }
            }
        }
    }

    Json(val)
}

async fn handle_get_accounts_json(State(app_state): State<Arc<AppState>>) -> impl IntoResponse {
    let json_val = handle_get_accounts(State(app_state)).await;
    let content = serde_json::to_string_pretty(&json_val.0).unwrap_or_default();
    (StatusCode::OK, [("content-type", "application/json; charset=utf-8")], content).into_response()
}

#[derive(Deserialize)]
struct SwitchParams {
    id: Option<String>,
}

async fn handle_switch_account(
    Query(params): Query<SwitchParams>,
    State(app_state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    let target_id = params.id.unwrap_or_default();
    let p = get_accounts_path();
    let mut switched_email = String::new();
    let mut has_token = false;

    if let Ok(c) = fs::read_to_string(&p) {
        let clean = c.trim_start_matches('\u{feff}');
        if let Ok(mut val) = serde_json::from_str::<serde_json::Value>(clean) {
            if let Some(accs) = val.get_mut("accounts").and_then(|a| a.as_array_mut()) {
                for a in accs {
                    let id = a.get("id").and_then(|v| v.as_str()).unwrap_or("");
                    if id == target_id {
                        a["is_active"] = serde_json::Value::Bool(true);
                        switched_email = a.get("email").and_then(|v| v.as_str()).unwrap_or("").to_string();

                        // Refresh fresh access token & id_token via Google OAuth before vault injection!
                        let mut final_cred = a.get("credential_data").cloned().unwrap_or_else(|| serde_json::json!({
                            "auth_method": "consumer",
                            "id_token": "",
                            "token": { "access_token": "", "refresh_token": "", "token_type": "Bearer" }
                        }));
                        let refresh_opt = final_cred.get("token")
                            .and_then(|t| t.get("refresh_token"))
                            .and_then(|rt| rt.as_str())
                            .map(|s| s.to_string());

                        if let Some(r_tok) = refresh_opt {
                            if !r_tok.is_empty() {
                                has_token = true;
                                let client = reqwest::Client::new();
                                if let Ok(resp) = client
                                    .post("https://oauth2.googleapis.com/token")
                                    .form(&[
                                        ("client_id", get_google_client_id()),
                                        ("client_secret", get_google_client_secret()),
                                        ("refresh_token", r_tok.clone()),
                                        ("grant_type", "refresh_token".to_string()),
                                    ])
                                    .send()
                                    .await
                                {
                                    if let Ok(new_tok) = resp.json::<GoogleTokenResponse>().await {
                                        if let Some(tok_obj) = final_cred.get_mut("token").and_then(|t| t.as_object_mut()) {
                                            tok_obj.insert("access_token".to_string(), serde_json::Value::String(new_tok.access_token));
                                            tok_obj.insert("token_type".to_string(), serde_json::Value::String("Bearer".to_string()));
                                            tok_obj.insert("refresh_token".to_string(), serde_json::Value::String(r_tok.to_string()));
                                        }
                                        if let Some(new_id) = new_tok.id_token {
                                            if !new_id.is_empty() {
                                                final_cred["id_token"] = serde_json::Value::String(new_id);
                                            }
                                        }
                                        // Update on-disk accounts.json record too
                                        a["credential_data"] = final_cred.clone();
                                        tracing::info!("[HOT-SWAP] Successfully refreshed OAuth tokens for {}", switched_email);
                                    }
                                }
                            }
                        }

                        // Write to Windows Credential Manager if token exists
                        #[cfg(target_os = "windows")]
                        if has_token {
                            let cred_str = serde_json::to_string(&final_cred).unwrap_or_default();
                            let ok = write_credential_vault("gemini:antigravity", "antigravity", cred_str.as_bytes());
                            tracing::info!("[HOT-SWAP] Credential Vault injection result: {}", ok);
                        }
                    } else {
                        a["is_active"] = serde_json::Value::Bool(false);
                    }
                }
            }
            val["active_account_id"] = serde_json::Value::String(target_id.clone());
            val["last_switched"] = serde_json::Value::String(chrono::Utc::now().to_rfc3339());
            let json_str = serde_json::to_string_pretty(&val).unwrap_or_default();
            let _ = fs::write(&p, &json_str);
            if let Ok(exe) = std::env::current_exe() {
                if let Some(dir) = exe.parent() {
                    let exe_json = dir.join("accounts.json");
                    if exe_json != p {
                        let _ = fs::write(exe_json, &json_str);
                    }
                }
            }
        }
    }

    // Update in-memory state
    {
        let mut accs = app_state.accounts.write();
        for a in accs.iter_mut() {
            a.is_active = a.id == target_id;
        }
    }

    // Instantly restart Antigravity IDE so the new account token takes effect immediately
    #[cfg(target_os = "windows")]
    if has_token {
        restart_antigravity_ide();
    }

    Json(serde_json::json!({
        "success": true,
        "active_id": target_id,
        "email": switched_email,
        "restarted": has_token,
        "has_token": has_token
    }))
}

async fn handle_restart_antigravity() -> Json<serde_json::Value> {
    #[cfg(target_os = "windows")]
    restart_antigravity_ide();
    Json(serde_json::json!({ "success": true, "message": "Antigravity IDE restarted." }))
}

#[derive(Deserialize)]
struct AddAccountBody {
    email: Option<String>,
    name: Option<String>,
    id: Option<String>,
    token: Option<String>,
}

async fn handle_add_account(
    State(app_state): State<Arc<AppState>>,
    Json(body): Json<AddAccountBody>,
) -> Json<serde_json::Value> {
    let email = body.email.unwrap_or_default();
    let name = body.name.unwrap_or_else(|| email.split('@').next().unwrap_or(&email).to_string());
    let id = body.id.unwrap_or_else(|| format!("acc_{}", chrono::Utc::now().timestamp()));
    let refresh_token = body.token.unwrap_or_default();

    if !email.is_empty() {
        save_account_to_disk(&email, &name, &refresh_token, "", "");
        let mut accs = app_state.accounts.write();
        accs.retain(|a| a.email.to_lowercase() != email.to_lowercase());
        let initials = if name.len() >= 2 { name.chars().take(2).collect::<String>().to_uppercase() } else { "GO".to_string() };
        accs.push(Account {
            id: id.clone(),
            email: email.clone(),
            avatar_color: "#2563eb".to_string(),
            initials,
            provider: "GOOGLE".to_string(),
            is_active: false,
            last_used: "Just added".to_string(),
            auth_token: "".to_string(),
            gemini_quota: GeminiQuota {
                weekly: QuotaMetric { percentage: 100, resets_in: "7d 0h".to_string() },
                five_hour: QuotaMetric { percentage: 100, resets_in: "Healthy".to_string() },
            },
            claude_gpt_quota: ClaudeGptQuota {
                weekly: QuotaMetric { percentage: 100, resets_in: "7d 0h".to_string() },
                five_hour: QuotaMetric { percentage: 100, resets_in: "Healthy".to_string() },
            },
        });
    }

    Json(serde_json::json!({ "success": true, "id": id, "email": email }))
}

#[derive(Deserialize)]
struct DeleteParams {
    id: Option<String>,
}

async fn handle_delete_account(
    Query(params): Query<DeleteParams>,
    State(app_state): State<Arc<AppState>>,
) -> Json<serde_json::Value> {
    let target_id = params.id.unwrap_or_default();
    let p = get_accounts_path();

    if let Ok(c) = fs::read_to_string(&p) {
        if let Ok(mut val) = serde_json::from_str::<serde_json::Value>(&c) {
            if let Some(accs) = val.get_mut("accounts").and_then(|a| a.as_array_mut()) {
                accs.retain(|a| a.get("id").and_then(|v| v.as_str()) != Some(&target_id));
            }
            let _ = fs::write(&p, serde_json::to_string_pretty(&val).unwrap_or_default());
        }
    }

    let mut accs = app_state.accounts.write();
    accs.retain(|a| a.id != target_id);

    Json(serde_json::json!({ "success": true, "deleted_id": target_id }))
}

async fn handle_oauth_callback(
    Query(params): Query<OAuthCallbackParams>,
    State(app_state): State<Arc<AppState>>,
) -> Response {
    if let Some(err) = params.error {
        let html = format!(
            r#"<!DOCTYPE html><html><body style="background:#0f1117;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
            <div style="text-align:center;"><h2>❌ Erreur OAuth Google</h2><p>{}</p></div></body></html>"#,
            err
        );
        return (StatusCode::BAD_REQUEST, Html(html)).into_response();
    }

    let code = match params.code {
        Some(c) => c,
        None => return (StatusCode::BAD_REQUEST, Html("Aucun code reçu".to_string())).into_response(),
    };

    let client = reqwest::Client::new();
    let g_cid = get_google_client_id();
    let g_sec = get_google_client_secret();
    let token_resp = client
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("code", code.as_str()),
            ("client_id", g_cid.as_str()),
            ("client_secret", g_sec.as_str()),
            ("redirect_uri", GOOGLE_REDIRECT_URI),
            ("grant_type", "authorization_code"),
        ])
        .send()
        .await;

    let mut real_email = "user@gmail.com".to_string();
    let mut real_name = "Google User".to_string();
    let mut access_tok = "".to_string();
    let mut refresh_tok = "".to_string();
    let mut id_tok = "".to_string();

    if let Ok(resp) = token_resp {
        if resp.status().is_success() {
            if let Ok(tok) = resp.json::<GoogleTokenResponse>().await {
                access_tok = tok.access_token.clone();
                refresh_tok = tok.refresh_token.unwrap_or_default();
                id_tok = tok.id_token.clone().unwrap_or_default();

                // Fetch authentic profile info directly from Google userinfo API
                if let Ok(ui_resp) = client
                    .get("https://www.googleapis.com/oauth2/v2/userinfo")
                    .bearer_auth(&tok.access_token)
                    .send()
                    .await
                {
                    if let Ok(info) = ui_resp.json::<GoogleUserInfo>().await {
                        real_email = info.email;
                        if !info.name.is_empty() { real_name = info.name; }
                    }
                }
            }
        }
    }

    let new_id = format!("acc_{}", chrono::Utc::now().timestamp());

    // Update in-memory app state
    {
        let mut oauth_lock = app_state.last_oauth.write();
        *oauth_lock = Some(OAuthStatusPayload {
            status: "success".to_string(),
            email: real_email.clone(),
            name: real_name.clone(),
            id: new_id.clone(),
        });

        let initials = if real_name.len() >= 2 {
            real_name.chars().take(2).collect::<String>().to_uppercase()
        } else {
            real_email.chars().take(2).collect::<String>().to_uppercase()
        };

        let mut accs = app_state.accounts.write();
        accs.retain(|a| a.email.to_lowercase() != real_email.to_lowercase());
        accs.push(Account {
            id: new_id.clone(),
            email: real_email.clone(),
            avatar_color: "#2563eb".to_string(),
            initials,
            provider: "GOOGLE".to_string(),
            is_active: false,
            last_used: "Session linked".to_string(),
            auth_token: access_tok.clone(),
            gemini_quota: GeminiQuota {
                weekly: QuotaMetric { percentage: 100, resets_in: "7d 0h".to_string() },
                five_hour: QuotaMetric { percentage: 100, resets_in: "Healthy".to_string() },
            },
            claude_gpt_quota: ClaudeGptQuota {
                weekly: QuotaMetric { percentage: 100, resets_in: "7d 0h".to_string() },
                five_hour: QuotaMetric { percentage: 100, resets_in: "Healthy".to_string() },
            },
        });
    }

    // Persist to accounts.json on disk!
    save_account_to_disk(&real_email, &real_name, &refresh_tok, &access_tok, &id_tok);

    let html = format!(
        r#"<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Compte li&eacute; avec succ&egrave;s</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0f1117;color:#e2e8f0}}
.card{{background:#1a1d27;border:1px solid #2d3348;border-radius:20px;padding:48px 40px;text-align:center;max-width:440px;width:90%;box-shadow:0 25px 60px rgba(0,0,0,.5)}}
.check{{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;margin:0 auto 20px}}
.check svg{{width:32px;height:32px;stroke:white}}
h2{{font-size:18px;font-weight:700;color:#f1f5f9;margin-bottom:6px}}
.email{{color:#8ab4f8;font-size:14.5px;font-weight:600;margin-bottom:16px;display:block}}
p{{color:#94a3b8;font-size:13px;line-height:1.5}}
.badge{{display:inline-block;background:#1e293b;border:1px solid #334155;border-radius:8px;padding:4px 12px;font-size:11px;color:#10b981;font-weight:600;margin-top:12px}}
.close-hint{{margin-top:20px;font-size:11px;color:#475569}}
</style>
</head>
<body>
<div class="card">
  <div class="check"><svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
  <h2>Compte li&eacute; avec succ&egrave;s</h2>
  <span class="email">{}</span>
  <p>Votre compte Google a &eacute;t&eacute; ajout&eacute; au pool Antigravity. Les quotas sont synchronis&eacute;s automatiquement.</p>
  <div class="badge">&#10003; Pool Antigravity actif</div>
  <p class="close-hint">Vous pouvez fermer cet onglet et retourner dans l'application.</p>
</div>
<script>setTimeout(function(){{try{{window.close()}}catch(e){{}}}},3500);</script>
</body></html>"#,
        real_email
    );

    (StatusCode::OK, Html(html)).into_response()
}
