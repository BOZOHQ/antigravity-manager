/**
 * Antigravity Manager - Core Engine
 * Professional Session & Quota Management
 */

// Official Brand Vector Logos (SVG)
const LOGOS = {
  google: `
    <svg class="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  `,
  gemini: `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
      <path d="m12 2 2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2Z" fill="url(#gemini-grad)"/>
      <defs>
        <linearGradient id="gemini-grad" x1="3" y1="2" x2="21" y2="20" gradientUnits="userSpaceOnUse">
          <stop stop-color="#70a5f7"/>
          <stop offset="0.5" stop-color="#c58af9"/>
          <stop offset="1" stop-color="#f87171"/>
        </linearGradient>
      </defs>
    </svg>
  `,
  claude: `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="#D97706">
      <path d="M13.8 3.5l1.6 3.2 3.5.5-2.5 2.5.6 3.5-3.2-1.7-3.2 1.7.6-3.5-2.5-2.5 3.5-.5 1.6-3.2z"/>
      <circle cx="12" cy="12" r="3" fill="#B45309"/>
    </svg>
  `
};

// Bilingual Dictionaries (French & English)
const TRANSLATIONS = {
  fr: {
    nav_accounts: "Comptes Google",
    nav_proxy: "Proxy Local",
    nav_settings: "Paramètres",
    sidebar_subtitle: "Hub Proxy & Sessions",
    sidebar_session_label: "Session",
    sidebar_session_status: "Active",
    sidebar_endpoint_label: "Endpoint",
    service_running: "Service en cours",
    service_stopped: "Service arrêté",
    sidebar_btn_stop: "Stop",
    sidebar_btn_start: "Start",
    titlebar_loading: "Chargement...",
    titlebar_proxy_status: "Proxy local :8045",
    titlebar_active_none: "Aucun compte actif",
    accounts_title: "Comptes & Quotas",
    accounts_subtitle: "Surveillance en temps réel des quotas Google et bascule transparente.",
    accounts_active_count: "session active",
    accounts_active_counts: "sessions actives",
    auto_switch_label: "Bascule auto (< 5%)",
    btn_test_swap: "Tester bascule (-8%)",
    btn_refresh_quotas: "Actualiser quotas",
    btn_restart_ide: "Relancer Antigravity",
    btn_add_account: "Ajouter un compte",
    select_all: "Tout sélectionner",
    filter_healthy: ">25% Normal",
    filter_warning: "6-25% Bas",
    filter_critical: "<= 5% Bascule",
    card_weekly: "Hebdomadaire",
    card_5h: "Fenêtre 5h",
    card_remaining: "restant",
    card_active: "Actif",
    card_use: "Utiliser",
    card_linked: "Session liée",
    card_status: "Statut :",
    card_reset: "Reset :",
    card_third_party: "Modèles tiers",
    badge_optimal: "Optimal",
    badge_normal: "Normal",
    badge_low: "Bas",
    badge_critical: "Critique",
    quota_healthy_state: "100% disponible",
    status_connected_windows: "Connecté (Session Windows)",
    status_recently_added: "Récemment ajouté",
    status_active_now: "Session active",
    status_ready: "Prêt",
    no_active_account: "Aucun compte actif",
    net_interface_label: "Interface Réseau",
    net_all: "Toutes",
    net_state_label: "État",
    btn_stop_service: "Stop Service",
    btn_start_service: "Start Service",
    proxy_title: "Serveur Proxy Local",
    proxy_subtitle: "Point d'entrée HTTP local compatible avec l'API OpenAI (/v1/chat/completions) et Claude.",
    proxy_url_label: "URL d'accès local (Base URL)",
    proxy_url_help: "À renseigner dans la configuration de votre IDE (Cursor, VS Code, Continue.dev).",
    net_config_title: "Configuration Réseau",
    net_port_label: "Port d'écoute",
    net_timeout_label: "Délai d'attente / Timeout (secondes)",
    net_autostart_title: "Démarrage automatique",
    net_autostart_sub: "Lancer le proxy dès l'ouverture de l'application",
    api_key_title: "Clé d'accès API (Bearer Token)",
    api_key_help: "Protège votre endpoint local si d'autres machines accèdent à votre réseau.",
    api_key_label: "Clé Secrète",
    btn_regen_key: "Régénérer une nouvelle clé",
    traffic_log_title: "Journal des requêtes HTTP",
    traffic_listening: "Écoute sur :8045",
    traffic_initial_log: "[SYSTEM] Proxy prêt sur 0.0.0.0:8045. Seuil de bascule fixé à 5.0%.",
    settings_title: "Paramètres",
    settings_subtitle: "Configuration du thème, des synchronisations et du cache local.",
    settings_appearance_title: "Apparence & Thème",
    settings_theme_label: "Thème de l'interface",
    settings_theme_sub: "Basculez entre le mode sombre et le mode clair",
    settings_theme_dark: "Sombre",
    settings_theme_light: "Clair",
    settings_lang_title: "Langue",
    settings_lang_sub: "Langue d'affichage",
    settings_accounts_title: "Comportement des Comptes",
    settings_refresh_label: "Actualisation périodique des quotas",
    settings_refresh_sub: "Interroge l'API Cloud Code en tâche de fond",
    settings_sync_label: "Synchronisation automatique avec le coffre",
    settings_sync_sub: "Lit automatiquement les tokens stockés dans le Credential Manager Windows",
    modal_title: "Ajouter un compte Google",
    modal_email_label: "Adresse Email Google",
    modal_token_label: "Jeton OAuth / Refresh Token (optionnel)",
    modal_email_placeholder: "utilisateur@gmail.com",
    modal_token_placeholder: "1//03Gvo... (optionnel)",
    modal_cancel: "Annuler",
    modal_save: "Enregistrer le compte",
    btn_official_google_signin: "Se connecter avec Google (Page Officielle)",
    oauth_help_text: "Connectez-vous directement sur la page officielle de Google. Vos quotas seront automatiquement synchronisés sans aucune manipulation manuelle.",
    oauth_or_divider: "ou saisie directe",
    oauth_pending_title: "Authentification Google en cours...",
    oauth_pending_sub: "La page officielle accounts.google.com s'est ouverte dans votre navigateur. Choisissez votre compte pour finaliser la liaison.",
    oauth_status_label: "Statut OAuth :",
    oauth_waiting_user: "En attente de sélection...",
    oauth_btn_confirm: "Confirmer la connexion",
    toast_oauth_success: "Compte Google {0} connecté et lié avec succès !",
    toast_oauth_opening: "Ouverture de la page officielle accounts.google.com...",
    toast_lang_switched: "Langue changée en Français",
    toast_theme_dark: "Mode sombre activé",
    toast_account_switched: "Session activée : {0}",
    toast_ide_restarted: "Antigravity redémarré avec succès !",
    toast_no_token_saved: "Le compte {0} n'a pas de jeton enregistré sur disque. Connectez-vous avec Google pour l'enregistrer.",
    toast_auto_switch: "Bascule automatique : {0} épuisé. Remplacé par {1}",
    toast_all_depleted: "Attention : Tous les comptes ont atteint leur limite de quota !",
    toast_syncing: "Synchronisation des comptes en cours...",
    toast_synced: "{0} compte(s) vérifié(s) dans le coffre.",
    toast_session_synced: "Session synchronisée avec succès.",
    toast_auto_switch_enabled: "Bascule automatique : Activée",
    toast_auto_switch_disabled: "Bascule automatique : Désactivée",
    toast_proxy_started: "Proxy démarré.",
    toast_proxy_stopped: "Proxy arrêté.",
    toast_net_interface: "Interface réseau : {0}",
    toast_url_copied: "URL du proxy copiée !",
    toast_key_copied: "Clé copiée !",
    toast_key_regen: "Nouvelle clé générée.",
    toast_email_required: "Veuillez renseigner une adresse email valide.",
    toast_account_added: "Compte {0} ajouté avec succès.",
    toast_account_deleted: "Compte {0} supprimé avec succès.",
    card_delete_confirm: "Supprimer ce compte ?",
    scopes_required: "Reconnexion requise",
    toast_close_info: "Pour fermer l'application, fermez l'onglet ou la fenêtre."
  },
  en: {
    nav_accounts: "Google Accounts",
    nav_proxy: "Local Proxy",
    nav_settings: "Settings",
    sidebar_subtitle: "Proxy & Session Hub",
    sidebar_session_label: "Session",
    sidebar_session_status: "Active",
    sidebar_endpoint_label: "Endpoint",
    service_running: "Service running",
    service_stopped: "Service stopped",
    sidebar_btn_stop: "Stop",
    sidebar_btn_start: "Start",
    titlebar_loading: "Loading...",
    titlebar_proxy_status: "Local proxy :8045",
    titlebar_active_none: "No active account",
    accounts_title: "Accounts & Quotas",
    accounts_subtitle: "Real-time Google quota telemetry and seamless hot-swapping.",
    accounts_active_count: "active session",
    accounts_active_counts: "active sessions",
    auto_switch_label: "Auto-Switch (< 5%)",
    btn_test_swap: "Simulate Usage (-8%)",
    btn_refresh_quotas: "Refresh Quotas",
    btn_restart_ide: "Restart Antigravity",
    btn_add_account: "Add Account",
    select_all: "Select All",
    filter_healthy: ">25% Healthy",
    filter_warning: "6-25% Low",
    filter_critical: "<= 5% Switch",
    card_weekly: "Weekly Limit",
    card_5h: "5-Hour Limit",
    card_remaining: "remaining",
    card_active: "Active",
    card_use: "Use",
    card_linked: "Session linked",
    card_status: "Status:",
    card_reset: "Reset:",
    card_third_party: "Third-party models",
    badge_optimal: "Optimal",
    badge_normal: "Normal",
    badge_low: "Low",
    badge_critical: "Critical",
    quota_healthy_state: "100% available",
    status_connected_windows: "Connected (Windows Session)",
    status_recently_added: "Recently added",
    status_active_now: "Active session",
    status_ready: "Ready",
    no_active_account: "No active account",
    net_interface_label: "Network Interface",
    net_all: "All",
    net_state_label: "État",
    btn_stop_service: "Stop Service",
    btn_start_service: "Start Service",
    proxy_title: "Local Proxy Server",
    proxy_subtitle: "Local HTTP endpoint compatible with OpenAI (/v1/chat/completions) & Claude.",
    proxy_url_label: "Local Access URL (Base URL)",
    proxy_url_help: "Enter this URL in your IDE configuration (Cursor, VS Code, Continue.dev).",
    net_config_title: "Network Configuration",
    net_port_label: "Listen Port",
    net_timeout_label: "Request Timeout (seconds)",
    net_autostart_title: "Auto-Start",
    net_autostart_sub: "Launch proxy server on app startup",
    api_key_title: "API Authentication Key (Bearer Token)",
    api_key_help: "Protects your local proxy when shared on local network.",
    api_key_label: "Secret Key",
    btn_regen_key: "Regenerate Key",
    traffic_log_title: "HTTP Traffic Logs",
    traffic_listening: "Listening on :8045",
    traffic_initial_log: "[SYSTEM] Proxy ready on 0.0.0.0:8045. Auto-switch threshold at 5.0%.",
    settings_title: "Settings",
    settings_subtitle: "Appearance, theme, sync preferences and local cache.",
    settings_appearance_title: "Appearance & Theme",
    settings_theme_label: "Interface Theme",
    settings_theme_sub: "Toggle between dark mode and light mode",
    settings_theme_dark: "Dark",
    settings_theme_light: "Light",
    settings_lang_title: "Language",
    settings_lang_sub: "Display language",
    settings_accounts_title: "Account Behavior",
    settings_refresh_label: "Auto Refresh Quotas",
    settings_refresh_sub: "Polls Cloud Code quota API in background",
    settings_sync_label: "Auto Sync Local Vault",
    settings_sync_sub: "Automatically reads tokens from Windows Credential Manager",
    modal_title: "Connect Google Account",
    modal_email_label: "Google Account Email",
    modal_token_label: "OAuth / Refresh Token (optional)",
    modal_email_placeholder: "user@gmail.com",
    modal_token_placeholder: "1//03Gvo... (optional)",
    modal_cancel: "Cancel",
    modal_save: "Save Account",
    btn_official_google_signin: "Sign in with Google (Official Page)",
    oauth_help_text: "Sign in directly on the official Google page. Your quotas and session will be automatically linked without manual token configuration.",
    oauth_or_divider: "or direct entry",
    oauth_pending_title: "Google Authentication in progress...",
    oauth_pending_sub: "The official accounts.google.com page is open in your browser. Select your account to complete linking.",
    oauth_status_label: "OAuth Status:",
    oauth_waiting_user: "Waiting for account selection...",
    oauth_btn_confirm: "Confirm & Link Account",
    toast_oauth_success: "Google account {0} successfully linked!",
    toast_oauth_opening: "Opening official Google sign-in page...",
    toast_lang_switched: "Language switched to English",
    toast_theme_dark: "Dark mode enabled",
    toast_theme_light: "Light mode enabled",
    toast_account_switched: "Active session: {0}",
    toast_ide_restarted: "Antigravity restarted successfully!",
    toast_no_token_saved: "Account {0} has no token saved to disk. Sign in with Google to save it.",
    toast_no_active_test: "No active account to test.",
    toast_auto_switch: "Auto-switch: {0} depleted. Replaced by {1}",
    toast_all_depleted: "Warning: All accounts have reached quota limits!",
    toast_syncing: "Syncing accounts...",
    toast_synced: "{0} account(s) verified in vault.",
    toast_session_synced: "Session successfully synced.",
    toast_auto_switch_enabled: "Auto-switch: Enabled",
    toast_auto_switch_disabled: "Auto-switch: Disabled",
    toast_proxy_started: "Proxy started.",
    toast_proxy_stopped: "Proxy stopped.",
    toast_net_interface: "Network interface: {0}",
    toast_url_copied: "Proxy URL copied!",
    toast_key_copied: "API key copied!",
    toast_key_regen: "New API key generated.",
    toast_email_required: "Please enter a valid email address.",
    toast_account_added: "Account {0} added successfully.",
    toast_account_deleted: "Account {0} deleted successfully.",
    card_delete_confirm: "Delete this account?",
    scopes_required: "Re-auth required",
    toast_close_info: "To close the application, close the window."
  }
};

// Initial State - Pure Dynamic Vault
const state = {
  accounts: [],
  selectedAccountIds: new Set(),
  autoSwitchEnabled: true,
  autoRefreshQuota: true,
  autoSyncCurrentAccount: true,
  currentTab: 'accounts',
  theme: localStorage.getItem('ag_theme') || 'dark',
  lang: localStorage.getItem('ag_lang') || 'fr',

  proxy: {
    isRunning: true,
    ip: '192.168.1.106',
    port: 8045,
    timeoutSeconds: 120,
    apiKey: 'sk-antigravity-pool-9f8a32d1e4c7',
    keyVisible: false,
    autoStart: true,
  }
};

// ==========================================
// Language Translation Engine
// ==========================================

function applyLanguage(lang) {
  state.lang = lang;
  localStorage.setItem('ag_lang', lang);
  document.documentElement.lang = lang;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;

  // Translate all marked DOM elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Translate all input placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) {
      el.placeholder = t[key];
    }
  });

  // Update language button pills styling in Settings
  const frBtn = document.getElementById('btn-lang-fr');
  const enBtn = document.getElementById('btn-lang-en');
  if (frBtn && enBtn) {
    if (lang === 'fr') {
      frBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-theme-surface text-theme-primaryText border border-theme-border shadow-sm";
      enBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold text-theme-secondaryText hover:text-theme-primaryText border border-transparent";
    } else {
      enBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-theme-surface text-theme-primaryText border border-theme-border shadow-sm";
      frBtn.className = "px-3 py-1 rounded-lg text-xs font-semibold text-theme-secondaryText hover:text-theme-primaryText border border-transparent";
    }
  }

  // Update titlebar proxy status if present
  const titlebarProj = document.getElementById('titlebar-active-project');
  if (titlebarProj) titlebarProj.textContent = t.titlebar_proxy_status;

  // Update dynamic elements
  updateProxyUI();
  renderAccountsGrid();
}

// ==========================================
// Theme Engine (Dark / Light Switcher)
// ==========================================

function applyTheme(themeName) {
  state.theme = themeName;
  localStorage.setItem('ag_theme', themeName);

  const html = document.documentElement;
  html.classList.add('theme-transitioning');
  setTimeout(() => {
    html.classList.remove('theme-transitioning');
  }, 320);

  const sunIcon = document.getElementById('theme-sun-icon');
  const moonIcon = document.getElementById('theme-moon-icon');
  const darkBtnChoice = document.getElementById('btn-theme-dark-choice');
  const lightBtnChoice = document.getElementById('btn-theme-light-choice');

  if (themeName === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');

    if (lightBtnChoice) {
      lightBtnChoice.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-theme-surface text-theme-primaryText border border-theme-border shadow-sm";
    }
    if (darkBtnChoice) {
      darkBtnChoice.className = "px-3 py-1 rounded-lg text-xs font-semibold text-theme-secondaryText hover:text-theme-primaryText border border-transparent";
    }
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');

    if (darkBtnChoice) {
      darkBtnChoice.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-theme-surface text-theme-primaryText border border-theme-border shadow-sm";
    }
    if (lightBtnChoice) {
      lightBtnChoice.className = "px-3 py-1 rounded-lg text-xs font-semibold text-theme-secondaryText hover:text-theme-primaryText border border-transparent";
    }
  }
}

// ==========================================
// SVG Circular Gauges & Quota Helpers
// ==========================================

function getStatusColor(percentage) {
  if (percentage > 25) return 'var(--quota-healthy)';
  if (percentage > 5) return 'var(--quota-warning)';
  return 'var(--quota-critical)';
}

function renderCircularGauge(percentage, size = 42) {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = getStatusColor(percentage);

  return `
    <div class="relative flex items-center justify-center shrink-0" style="width: ${size}px; height: ${size}px;">
      <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="${radius}" fill="none" stroke-width="3.5" class="gauge-ring-bg"></circle>
        <circle cx="20" cy="20" r="${radius}" fill="none" stroke="${color}" stroke-width="3.5"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          class="gauge-ring-progress">
        </circle>
      </svg>
      <span class="absolute font-mono text-[11px] font-bold text-theme-primaryText">${percentage}%</span>
    </div>
  `;
}

function formatResetText(percentage, resetsIn, lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  if (percentage === 100 || !resetsIn || resetsIn === 'Sain' || resetsIn === 'Healthy' || resetsIn === '100%') {
    return `<span class="text-emerald-500 font-semibold font-mono text-[11px]">${t.quota_healthy_state}</span>`;
  }
  let cleanTime = String(resetsIn);
  if (lang === 'fr') {
    cleanTime = cleanTime.replace(/(\d+)\s*d/g, '$1j');
  } else {
    cleanTime = cleanTime.replace(/(\d+)\s*j/g, '$1d');
  }
  return `<span class="text-theme-mutedText text-[11px]">${t.card_reset}</span> <span class="text-theme-secondaryText font-medium font-mono text-[11px]">${cleanTime}</span>`;
}

function renderQuotaTile(title, percentage, resetsIn, lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  
  let badgeText = t.badge_normal || "Normal";
  let badgeColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  if (percentage === 100) {
    badgeText = t.badge_optimal || "Optimal";
    badgeColor = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  } else if (percentage <= 5) {
    badgeText = t.badge_critical || "Critique";
    badgeColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
  } else if (percentage <= 25) {
    badgeText = t.badge_low || "Bas";
    badgeColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }

  const resetDisplay = formatResetText(percentage, resetsIn, lang);

  return `
    <div class="flex items-center space-x-3.5 app-surface p-3 rounded-xl border border-theme-border/70 hover:border-theme-border transition shadow-sm">
      ${renderCircularGauge(percentage, 42)}
      <div class="min-w-0 flex-1 flex flex-col justify-center">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-theme-primaryText">${title}</span>
          <span class="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${badgeColor}">${badgeText}</span>
        </div>
        <div class="text-[11px] mt-1.5 flex items-center justify-between">
          <div class="truncate">${resetDisplay}</div>
          <span class="text-[10px] text-theme-mutedText font-normal">${t.card_remaining}</span>
        </div>
      </div>
    </div>
  `;
}

function getAccountStatusText(acc, lang) {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.fr;
  const statusStr = String(acc.lastUsed || '');
  if (acc.statusKey === 'connected_windows' || statusStr.includes('Session Windows') || statusStr.includes('Windows Session')) {
    return t.status_connected_windows;
  }
  if (acc.statusKey === 'recently_added' || statusStr.includes('Récemment') || statusStr.includes('Recently')) {
    return t.status_recently_added;
  }
  if (acc.isActive) {
    return t.status_active_now;
  }
  return statusStr || t.status_ready;
}

// ==========================================
// Rendering Engine
// ==========================================

function renderAccountsGrid() {
  const grid = document.getElementById('accounts-grid');
  if (!grid) return;

  const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;

  const activeAccount = state.accounts.find(a => a.isActive);
  const titlebarEl = document.getElementById('titlebar-active-account');
  if (titlebarEl) {
    titlebarEl.textContent = activeAccount ? activeAccount.email : t.no_active_account;
  }
  
  const sbCount = document.getElementById('sidebar-accounts-count');
  if (sbCount) sbCount.textContent = state.accounts.length;

  const fleetEl = document.getElementById('accounts-fleet-count');
  if (fleetEl) {
    const plural = state.accounts.length > 1 ? t.accounts_active_counts : t.accounts_active_count;
    fleetEl.textContent = `${state.accounts.length} ${plural}`;
  }

  grid.innerHTML = state.accounts.map(acc => {
    const isSelected = state.selectedAccountIds.has(acc.id);

    return `
      <div class="account-card app-surface rounded-2xl border ${acc.isActive ? 'account-card-active' : 'border-theme-border'} p-4 flex flex-col justify-between shadow-sm space-y-3">
        
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <input type="checkbox" data-account-id="${acc.id}" class="account-select-checkbox w-3.5 h-3.5 rounded bg-theme-elevated border-theme-border text-theme-accent focus:ring-0" ${isSelected ? 'checked' : ''}>
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono text-white shadow-sm ring-1 ring-white/10" style="background-color: ${acc.avatarColor};">
              ${acc.initials}
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-semibold text-theme-primaryText font-mono">${acc.email}</span>
                <span class="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full app-elevated text-theme-secondaryText border font-mono">
                  ${LOGOS.google}
                  Google
                </span>
              </div>
              <div class="text-[10px] text-theme-secondaryText flex items-center gap-1 mt-0.5">
                <span>${t.card_status}</span>
                <span class="text-theme-primaryText font-medium">${getAccountStatusText(acc, state.lang)}</span>
              </div>
            </div>
          </div>

          <!-- Actions: Delete & Active Badge / Switch Button -->
          <div class="flex items-center space-x-1.5">
            <button onclick="handleDeleteAccount('${acc.id}', '${acc.email}')" title="Supprimer ce compte" class="p-1.5 rounded-lg text-theme-secondaryText hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>

            ${acc.isActive ? `
              <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 pulsing-indicator"></span>
                <span>${t.card_active}</span>
              </span>
            ` : `
              <button onclick="handleSwitchClick('${acc.id}')" class="px-3 py-1 rounded-lg text-xs font-semibold app-elevated hover:bg-theme-hover text-theme-primaryText border transition">
                ${t.card_use}
              </button>
            `}
          </div>
        </div>

        <!-- Quota Sections -->
        <div class="space-y-2.5 pt-1">
          
          <!-- Gemini Models Quota Block -->
          <div class="app-elevated border rounded-xl p-3 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-theme-primaryText flex items-center gap-1.5">
                ${LOGOS.gemini}
                Google Gemini
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-theme-surface text-theme-secondaryText border border-theme-border">Flash & Pro</span>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              ${renderQuotaTile(t.card_weekly, acc.quotas.gemini.weekly.percentage, acc.quotas.gemini.weekly.resetsIn, state.lang)}
              ${renderQuotaTile(t.card_5h, acc.quotas.gemini.fiveHour.percentage, acc.quotas.gemini.fiveHour.resetsIn, state.lang)}
            </div>
          </div>

          <!-- Claude / Third-Party Models Quota Block -->
          <div class="app-elevated border rounded-xl p-3 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-theme-primaryText flex items-center gap-1.5">
                ${LOGOS.claude}
                Anthropic Claude & GPT
              </span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-md bg-theme-surface text-theme-secondaryText border border-theme-border">${t.card_third_party}</span>
            </div>

            <div class="grid grid-cols-2 gap-2.5">
              ${renderQuotaTile(t.card_weekly, acc.quotas.claudeGpt.weekly.percentage, acc.quotas.claudeGpt.weekly.resetsIn, state.lang)}
              ${renderQuotaTile(t.card_5h, acc.quotas.claudeGpt.fiveHour.percentage, acc.quotas.claudeGpt.fiveHour.resetsIn, state.lang)}
            </div>
          </div>

        </div>

        <!-- Footer status details -->
        <div class="flex items-center justify-between text-[11px] text-theme-secondaryText pt-1.5 border-t border-theme-border">
          <span class="font-mono text-[10px]">${acc.id}</span>
          <span class="text-theme-healthy flex items-center gap-1 font-medium text-xs">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            ${t.card_linked}
          </span>
        </div>
      </div>
    `;
  }).join('');

  attachAccountCardEvents();
}

function attachAccountCardEvents() {
  const checkboxes = document.querySelectorAll('.account-select-checkbox');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-account-id');
      if (e.target.checked) {
        state.selectedAccountIds.add(id);
      } else {
        state.selectedAccountIds.delete(id);
      }
      updateSelectAllHeader();
    });
  });
}

function updateSelectAllHeader() {
  const selectAll = document.getElementById('check-select-all');
  const countEl = document.getElementById('selected-count');
  const batchDelBtn = document.getElementById('btn-delete-selected');
  if (countEl) countEl.textContent = state.selectedAccountIds.size;
  if (selectAll) {
    selectAll.checked = (state.selectedAccountIds.size === state.accounts.length && state.accounts.length > 0);
  }
  if (batchDelBtn) {
    if (state.selectedAccountIds.size > 0) {
      batchDelBtn.classList.remove('hidden');
      batchDelBtn.textContent = `Supprimer (${state.selectedAccountIds.size})`;
    } else {
      batchDelBtn.classList.add('hidden');
    }
  }
}

// ==========================================
// Account Switching & Simulation
// ==========================================

function handleAccountSwitchInternal(targetAccountId) {
  const prevActive = state.accounts.find(a => a.isActive);
  const nextActive = state.accounts.find(a => a.id === targetAccountId);

  if (!nextActive) {
    return { success: false, message: "Target account not found." };
  }

  appendProxyLog(`[SWAP] Bascule du compte actif vers : ${nextActive.email}`);

  state.accounts.forEach(a => {
    a.isActive = (a.id === targetAccountId);
    if (a.id === targetAccountId) {
      a.lastUsed = "Actif (Session en cours)";
    }
  });

  // Persist switch to backend (accounts.json & Windows Credential Manager & auto-restart Antigravity)
  fetch(`http://127.0.0.1:8045/api/switch-account?id=${encodeURIComponent(targetAccountId)}`)
    .then(r => r.json())
    .then(data => {
      if (data && data.has_token === false) {
        appendProxyLog(`[ATTENTION] Le compte ${nextActive.email} n'a pas de jeton enregistré dans accounts.json.`);
        i18nToast('toast_no_token_saved', 'warning', nextActive.email);
      } else {
        appendProxyLog(`[PERSIST] Compte actif ${nextActive.email} sauvegardé dans le vault Windows.`);
        if (data && data.restarted) {
          appendProxyLog(`[RESTART] Antigravity IDE redémarré avec les nouveaux tokens.`);
          i18nToast('toast_ide_restarted', 'success', nextActive.email);
        }
      }
    })
    .catch(() => {});

  renderAccountsGrid();
  i18nToast('toast_account_switched', 'success', nextActive.email);
  return { success: true, activeId: targetAccountId };
}

window.handleSwitchClick = function(id) {
  handleAccountSwitchInternal(id);
};

function handleUsageSimulation(decrement = 8) {
  const activeAccount = state.accounts.find(a => a.isActive);
  if (!activeAccount) {
    i18nToast('toast_no_active_test', 'error');
    return;
  }

  let curFiveHour = activeAccount.quotas.gemini.fiveHour.percentage;
  let newFiveHour = Math.max(0, curFiveHour - decrement);
  activeAccount.quotas.gemini.fiveHour.percentage = newFiveHour;

  appendProxyLog(`[USAGE] -${decrement}% ${activeAccount.email} (${newFiveHour}%)`);

  if (state.autoSwitchEnabled && newFiveHour <= 5) {
    appendProxyLog(`[AUTO-SWITCH] <= 5% -> failover`);
    
    const candidates = state.accounts
      .filter(a => a.id !== activeAccount.id && a.quotas.gemini.fiveHour.percentage > 5)
      .sort((a, b) => b.quotas.gemini.fiveHour.percentage - a.quotas.gemini.fiveHour.percentage);

    if (candidates.length > 0) {
      const best = candidates[0];
      setTimeout(() => {
        handleAccountSwitchInternal(best.id);
        i18nToast('toast_auto_switch', 'warning', activeAccount.email, best.email);
      }, 350);
    } else {
      i18nToast('toast_all_depleted', 'error');
    }
  }

  renderAccountsGrid();
}

function syncVaultAccounts() {
  i18nToast('toast_syncing', 'info');
  
  fetch('accounts.json')
    .then(r => r.json())
    .then(data => {
      if (data && data.accounts && data.accounts.length > 0) {
        i18nToast('toast_synced', 'success', data.accounts.length);
      }
    })
    .catch(() => {
      i18nToast('toast_session_synced', 'success');
    });
}

// ==========================================
// Proxy Management UI
// ==========================================

function updateProxyUI() {
  const fullEndpoint = `http://${state.proxy.ip}:${state.proxy.port}/v1`;
  const epEl = document.getElementById('proxy-full-endpoint');
  if (epEl) epEl.textContent = fullEndpoint;
  
  const portEl = document.getElementById('bg-service-port');
  if (portEl) portEl.textContent = state.proxy.port;
  
  const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;

  const statusIndicator = document.getElementById('proxy-status-indicator');
  const statusBtnLabel = document.getElementById('proxy-status-button-label');
  const sidebarBtn = document.getElementById('btn-sidebar-toggle-proxy');
  const sidebarPill = document.getElementById('sidebar-proxy-status-pill');
  const bgDot = document.getElementById('bg-service-dot');
  const bgText = document.getElementById('bg-service-text');

  if (state.proxy.isRunning) {
    if (statusIndicator) statusIndicator.className = "w-2 h-2 rounded-full bg-emerald-500";
    if (statusBtnLabel) statusBtnLabel.textContent = t.btn_stop_service;
    if (sidebarBtn) sidebarBtn.textContent = t.sidebar_btn_stop;
    if (sidebarPill) sidebarPill.className = "w-1.5 h-1.5 rounded-full bg-emerald-500";
    if (bgDot) bgDot.className = "w-2 h-2 rounded-full bg-emerald-500 pulsing-indicator";
    if (bgText) {
      bgText.textContent = t.service_running;
      bgText.className = "text-xs text-emerald-500 font-semibold";
    }
  } else {
    if (statusIndicator) statusIndicator.className = "w-2 h-2 rounded-full bg-slate-400";
    if (statusBtnLabel) statusBtnLabel.textContent = t.btn_start_service;
    if (sidebarBtn) sidebarBtn.textContent = t.sidebar_btn_start;
    if (sidebarPill) sidebarPill.className = "w-1.5 h-1.5 rounded-full bg-slate-400";
    if (bgDot) bgDot.className = "w-2 h-2 rounded-full bg-slate-400";
    if (bgText) {
      bgText.textContent = t.service_stopped;
      bgText.className = "text-xs text-slate-400 font-semibold";
    }
  }
}

function appendProxyLog(msg) {
  const logBox = document.getElementById('proxy-live-logs');
  if (!logBox) return;
  const time = new Date().toLocaleTimeString();
  const div = document.createElement('div');
  div.textContent = `[${time}] ${msg}`;
  logBox.appendChild(div);
  logBox.scrollTop = logBox.scrollHeight;
}

// ==========================================
// Bulletproof Static Tab Switching
// ==========================================

function switchTab(tabName) {
  state.currentTab = tabName;

  // Update sidebar active buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === tabName;
    if (isTarget) {
      btn.className = "tab-btn w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-theme-primaryText bg-theme-elevated border border-theme-border shadow-sm";
    } else {
      btn.className = "tab-btn w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-theme-secondaryText hover:text-theme-primaryText hover:bg-theme-hover";
    }
  });

  // Show only targeted view and hide all others
  const views = ['accounts', 'proxy', 'settings'];
  views.forEach(v => {
    const panel = document.getElementById(`view-${v}`);
    if (panel) {
      if (v === tabName) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    }
  });

  const container = document.querySelector('.view-container');
  if (container) {
    container.scrollTop = 0;
  }
}

// Smooth Modal Open & Animated Exit
function resetAddAccountModal() {
  const idleView = document.getElementById('oauth-view-idle');
  const pendingView = document.getElementById('oauth-view-pending');
  const footer = document.getElementById('modal-default-footer');
  const input = document.getElementById('input-new-email');
  const progressBar = document.getElementById('oauth-progress-bar');
  const statusText = document.getElementById('oauth-status-text');
  const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;

  if (typeof stopOAuthPolling === 'function') {
    stopOAuthPolling();
  }
  if (idleView) idleView.classList.remove('hidden');
  if (pendingView) pendingView.classList.add('hidden');
  if (footer) footer.classList.remove('hidden');
  if (input) input.value = '';
  if (progressBar) progressBar.style.width = '50%';
  if (statusText) {
    statusText.textContent = t.oauth_waiting_user || 'En attente de sélection...';
    statusText.classList.remove('text-emerald-500');
  }
}

function openAddAccountModal() {
  const modal = document.getElementById('modal-add-account');
  if (!modal) return;
  resetAddAccountModal();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  requestAnimationFrame(() => {
    modal.classList.add('modal-show');
  });
}

function closeAddAccountModal() {
  const modal = document.getElementById('modal-add-account');
  if (!modal) return;
  modal.classList.remove('modal-show');
  setTimeout(() => {
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    resetAddAccountModal();
  }, 200);
}

// ==========================================
// Toast System
// ==========================================

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  
  let borderColor = 'border-theme-border';
  let badgeColor = 'bg-theme-accent';
  if (type === 'success') {
    badgeColor = 'bg-emerald-500';
  } else if (type === 'warning') {
    badgeColor = 'bg-amber-500';
  } else if (type === 'error') {
    badgeColor = 'bg-rose-500';
  }

  toast.className = `smooth-toast p-3 rounded-xl app-surface border ${borderColor} shadow-xl flex items-center space-x-2 text-xs text-theme-primaryText pointer-events-auto`;
  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full ${badgeColor}"></span>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px) scale(0.96)';
    toast.style.transition = 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => toast.remove(), 240);
  }, 2800);
}

function i18nToast(key, type = 'info', ...args) {
  const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;
  let msg = t[key] || key;
  args.forEach((val, idx) => {
    msg = msg.replace(`{${idx}}`, val);
  });
  showToast(msg, type);
}

// ==========================================
// Event Listeners & Bootstrapping
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Button in Header
  document.getElementById('btn-theme-toggle').addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;
    showToast(nextTheme === 'dark' ? t.toast_theme_dark : t.toast_theme_light, 'info');
  });

  // Theme Choice Buttons in Settings Tab
  document.getElementById('btn-theme-dark-choice').addEventListener('click', () => {
    applyTheme('dark');
    const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;
    showToast(t.toast_theme_dark, 'info');
  });
  
  document.getElementById('btn-theme-light-choice').addEventListener('click', () => {
    applyTheme('light');
    const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;
    showToast(t.toast_theme_light, 'info');
  });

  // Language Selector Buttons in Settings Tab
  const btnLangFr = document.getElementById('btn-lang-fr');
  const btnLangEn = document.getElementById('btn-lang-en');
  if (btnLangFr) {
    btnLangFr.addEventListener('click', () => {
      applyLanguage('fr');
      showToast(TRANSLATIONS.fr.toast_lang_switched, 'info');
    });
  }
  if (btnLangEn) {
    btnLangEn.addEventListener('click', () => {
      applyLanguage('en');
      showToast(TRANSLATIONS.en.toast_lang_switched, 'info');
    });
  }

  // Navigation Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // Select all checkbox
  const checkSelectAll = document.getElementById('check-select-all');
  checkSelectAll.addEventListener('change', (e) => {
    if (e.target.checked) {
      state.accounts.forEach(a => state.selectedAccountIds.add(a.id));
    } else {
      state.selectedAccountIds.clear();
    }
    renderAccountsGrid();
    updateSelectAllHeader();
  });

  // Batch delete button
  const batchDelBtn = document.getElementById('btn-delete-selected');
  if (batchDelBtn) {
    batchDelBtn.addEventListener('click', () => {
      const idsToDelete = Array.from(state.selectedAccountIds);
      if (idsToDelete.length === 0) return;
      if (!window.confirm(`Supprimer les ${idsToDelete.length} compte(s) sélectionné(s) ?`)) return;

      Promise.all(idsToDelete.map(id => fetch(`http://127.0.0.1:8045/api/delete-account?id=${encodeURIComponent(id)}`)))
        .then(() => {
          state.accounts = state.accounts.filter(a => !state.selectedAccountIds.has(a.id));
          state.selectedAccountIds.clear();
          if (state.accounts.length > 0 && !state.accounts.some(a => a.isActive)) {
            state.accounts[0].isActive = true;
          }
          renderAccountsGrid();
          updateSelectAllHeader();
          i18nToast('toast_account_deleted', 'info', `${idsToDelete.length} compte(s)`);
        })
        .catch(() => {
          state.accounts = state.accounts.filter(a => !state.selectedAccountIds.has(a.id));
          state.selectedAccountIds.clear();
          renderAccountsGrid();
          updateSelectAllHeader();
        });
    });
  }

  // Auto-switch toggle
  const toggleAutoSwitch = document.getElementById('toggle-auto-switch');
  toggleAutoSwitch.addEventListener('change', (e) => {
    state.autoSwitchEnabled = e.target.checked;
    i18nToast(state.autoSwitchEnabled ? 'toast_auto_switch_enabled' : 'toast_auto_switch_disabled', 'info');
  });

  // Simulation Button
  document.getElementById('btn-simulate-usage').addEventListener('click', () => {
    handleUsageSimulation(8);
  });

  // Sync IDE & Refresh Quotas button
  document.getElementById('btn-sync-ide').addEventListener('click', () => {
    i18nToast('toast_syncing', 'info');
    fetchAndSyncLiveAccounts();
    setTimeout(() => {
      i18nToast('toast_synced', 'success', state.accounts.length);
    }, 800);
  });

  // Manual Restart Antigravity IDE button
  const restartBtn = document.getElementById('btn-restart-antigravity');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      appendProxyLog("[SYSTEM] Relance manuelle d'Antigravity IDE demandée...");
      fetch('http://127.0.0.1:8045/api/restart-antigravity')
        .then(() => {
          i18nToast('toast_ide_restarted', 'success');
        })
        .catch(() => {
          i18nToast('toast_ide_restarted', 'success');
        });
    });
  }

  // Proxy toggle
  const toggleProxyAction = () => {
    state.proxy.isRunning = !state.proxy.isRunning;
    updateProxyUI();
    appendProxyLog(state.proxy.isRunning ? "Serveur proxy démarré sur :8045" : "Serveur proxy arrêté");
    i18nToast(state.proxy.isRunning ? 'toast_proxy_started' : 'toast_proxy_stopped', state.proxy.isRunning ? "success" : "info");
  };

  document.getElementById('btn-toggle-proxy-service').addEventListener('click', toggleProxyAction);
  document.getElementById('btn-sidebar-toggle-proxy').addEventListener('click', toggleProxyAction);

  // Network Interface change via static button pills
  document.querySelectorAll('.net-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedIp = btn.getAttribute('data-interface');
      state.proxy.ip = selectedIp;
      updateProxyUI();

      document.querySelectorAll('.net-pill').forEach(p => {
        if (p.getAttribute('data-interface') === selectedIp) {
          p.className = "net-pill px-3 py-1 rounded-lg text-xs font-mono font-medium bg-theme-surface text-theme-primaryText border border-theme-border shadow-sm";
        } else {
          p.className = "net-pill px-3 py-1 rounded-lg text-xs font-mono font-medium text-theme-secondaryText hover:text-theme-primaryText";
        }
      });

      i18nToast('toast_net_interface', 'info', selectedIp);
    });
  });

  // Listen port change
  document.getElementById('input-listen-port').addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0 && val < 65536) {
      state.proxy.port = val;
      updateProxyUI();
    }
  });

  // Copy API endpoint
  document.getElementById('btn-copy-endpoint').addEventListener('click', () => {
    const ep = document.getElementById('proxy-full-endpoint').textContent;
    navigator.clipboard.writeText(ep);
    i18nToast('toast_url_copied', 'success');
  });

  // API Key Visibility & Copy
  const keyInput = document.getElementById('input-proxy-api-key');
  document.getElementById('btn-toggle-key-visibility').addEventListener('click', () => {
    state.proxy.keyVisible = !state.proxy.keyVisible;
    keyInput.type = state.proxy.keyVisible ? 'text' : 'password';
  });

  document.getElementById('btn-copy-api-key').addEventListener('click', () => {
    navigator.clipboard.writeText(keyInput.value);
    i18nToast('toast_key_copied', 'success');
  });

  document.getElementById('btn-regenerate-api-key').addEventListener('click', () => {
    const newKey = `sk-antigravity-pool-${Math.random().toString(36).substring(2, 10)}`;
    state.proxy.apiKey = newKey;
    keyInput.value = newKey;
    i18nToast('toast_key_regen', 'success');
    appendProxyLog("[AUTH] Clé API régénérée.");
  });

  // Modal Handlers with Silky Animation
  document.getElementById('btn-open-add-account').addEventListener('click', openAddAccountModal);
  document.getElementById('btn-close-modal').addEventListener('click', closeAddAccountModal);
  document.getElementById('btn-cancel-modal').addEventListener('click', closeAddAccountModal);

  // Close modal when clicking on glass backdrop
  document.getElementById('modal-add-account').addEventListener('click', (e) => {
    if (e.target.id === 'modal-add-account') {
      closeAddAccountModal();
    }
  });

  // ==========================================
  // Google OAuth Flow
  // ==========================================

  // The real Google OAuth consent URL �?" uses the same client_id with all official Antigravity scopes
  const GOOGLE_OAUTH_CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
  const GOOGLE_OAUTH_SCOPES = encodeURIComponent('openid email profile https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/aicode https://www.googleapis.com/auth/cclog https://www.googleapis.com/auth/experimentsandconfigs');
  const GOOGLE_OAUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_OAUTH_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A8045%2Fauth%2Fcallback&response_type=code&scope=${GOOGLE_OAUTH_SCOPES}&access_type=offline&prompt=consent`;

  function showOAuthPendingView() {
    const idleView = document.getElementById('oauth-view-idle');
    const pendingView = document.getElementById('oauth-view-pending');
    const footer = document.getElementById('modal-default-footer');

    if (idleView) idleView.classList.add('hidden');
    if (footer) footer.classList.add('hidden');
    if (pendingView) pendingView.classList.remove('hidden');
  }

  function addAccountFromOAuth(email, name, id, token = "") {
    if (!email) return;

    fetch('http://127.0.0.1:8045/api/add-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, name: name || email.split('@')[0], id: id, token: token || "" })
    }).finally(() => {
      fetchAndSyncLiveAccounts();
    });

    closeAddAccountModal();
    i18nToast('toast_oauth_success', 'success', email);
    appendProxyLog(`[AUTH] Compte Google ${email} enregistré avec succès.`);
  }

  let oauthPollingInterval = null;

  function stopOAuthPolling() {
    if (oauthPollingInterval) {
      clearInterval(oauthPollingInterval);
      oauthPollingInterval = null;
    }
  }

  function startOAuthPolling() {
    stopOAuthPolling();
    let attempts = 0;
    oauthPollingInterval = setInterval(() => {
      attempts++;
      if (attempts > 120) { // 2 minutes max
        stopOAuthPolling();
        return;
      }

      fetch('http://127.0.0.1:8045/api/oauth-status')
        .then(res => res.json())
        .then(data => {
          if (data && data.status === 'success' && data.email) {
            stopOAuthPolling();
            const progressBar = document.getElementById('oauth-progress-bar');
            const statusText = document.getElementById('oauth-status-text');
            const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;

            if (progressBar) progressBar.style.width = '100%';
            if (statusText) {
              statusText.textContent = '✓ ' + (t.badge_optimal || 'Connecté');
              statusText.classList.add('text-emerald-500');
            }

            const realEmail = data.email;
            setTimeout(() => {
              resetAddAccountModal();
              fetchAndSyncLiveAccounts();
              i18nToast('toast_oauth_success', 'success', realEmail);
              appendProxyLog(`[AUTH] Compte Google ${realEmail} connecté avec succès et jeton enregistré sur le disque.`);
            }, 600);
          }
        })
        .catch(() => {});
    }, 1000);
  }

  // "Sign in with Google" button — opens official Google consent page
  document.getElementById('btn-start-google-oauth').addEventListener('click', () => {
    i18nToast('toast_oauth_opening', 'info');
    showOAuthPendingView();
    startOAuthPolling();

    // Animate progress bar
    const progressBar = document.getElementById('oauth-progress-bar');
    if (progressBar) {
      progressBar.style.width = '30%';
      setTimeout(() => { progressBar.style.width = '65%'; }, 800);
    }

    // Open the real Google sign-in page in the default browser
    if (window.__TAURI__ && window.__TAURI__.core) {
      window.__TAURI__.core.invoke('open_browser', { url: GOOGLE_OAUTH_URL }).catch(() => {});
    }
    fetch('http://127.0.0.1:8045/api/open-oauth').catch(() => {});
    try { window.open(GOOGLE_OAUTH_URL, '_blank'); } catch (e) {}
  });

  // "Confirm" button on pending view
  document.getElementById('btn-oauth-force-success').addEventListener('click', () => {
    resetAddAccountModal();
    fetchAndSyncLiveAccounts();
  });

  // Cancel button on pending view
  document.getElementById('btn-oauth-cancel').addEventListener('click', () => {
    resetAddAccountModal();
  });

  // Manual email & token entry (direct / fallback)
  document.getElementById('btn-submit-add-account').addEventListener('click', () => {
    const email = document.getElementById('input-new-email').value.trim();
    const token = (document.getElementById('input-new-token')?.value || '').trim();
    if (!email) {
      i18nToast('toast_email_required', 'error');
      return;
    }
    addAccountFromOAuth(email, email.split('@')[0], `acc_${Date.now()}`, token);
  });

  // Window Controls
  document.getElementById('btn-win-minimize').addEventListener('click', () => {
    if (window.__TAURI__ && window.__TAURI__.core) {
      window.__TAURI__.core.invoke('window_control', { action: 'minimize' }).catch(() => {});
    } else {
      window.blur();
    }
  });
  document.getElementById('btn-win-maximize').addEventListener('click', () => {
    if (window.__TAURI__ && window.__TAURI__.core) {
      window.__TAURI__.core.invoke('window_control', { action: 'maximize' }).catch(() => {});
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  });
  document.getElementById('btn-win-close').addEventListener('click', () => {
    if (window.__TAURI__ && window.__TAURI__.core) {
      window.__TAURI__.core.invoke('window_control', { action: 'close' }).catch(() => {});
    } else {
      window.close();
    }
  });

  // Initial Theme & Language Boot
  applyTheme(state.theme);
  applyLanguage(state.lang);

  // Handle Account Deletion
  window.handleDeleteAccount = function(id, email) {
    const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;
    const confirmMsg = `${t.card_delete_confirm || "Supprimer ce compte ?"} (${email})`;
    if (!window.confirm(confirmMsg)) return;

    fetch(`http://127.0.0.1:8045/api/delete-account?id=${encodeURIComponent(id)}`)
      .then(r => r.json())
      .then(data => {
        state.accounts = state.accounts.filter(a => a.id !== id);
        if (state.accounts.length > 0 && !state.accounts.some(a => a.isActive)) {
          state.accounts[0].isActive = true;
        }
        renderAccountsGrid();
        i18nToast('toast_account_deleted', 'info', email);
        appendProxyLog(`[AUTH] Compte ${email} supprimé du gestionnaire.`);
      })
      .catch(() => {
        state.accounts = state.accounts.filter(a => a.id !== id);
        renderAccountsGrid();
        i18nToast('toast_account_deleted', 'info', email);
      });
  };

  // Sync real accounts & live quotas from vault
  function fetchAndSyncLiveAccounts() {
    fetch('http://127.0.0.1:8045/api/accounts')
      .then(r => r.json())
      .then(data => {
        if (data && data.accounts && Array.isArray(data.accounts)) {
          const colors = ['#2563eb', '#10b981', '#c58af9', '#f59e0b', '#ef4444', '#06b6d4'];
          const activeId = data.active_account_id;
          const t = TRANSLATIONS[state.lang] || TRANSLATIONS.fr;
          
          state.accounts = data.accounts.map((acc, idx) => {
            let initials = "GO";
            if (acc.name && acc.name.trim()) {
              const parts = acc.name.trim().split(/\s+/);
              initials = parts.length > 1 
                ? (parts[0][0] + parts[1][0]).toUpperCase()
                : parts[0].substring(0, 2).toUpperCase();
            } else {
              initials = acc.email.substring(0, 2).toUpperCase();
            }
            const isActive = (acc.id === activeId || acc.is_active === true);

            const hasToken = !!(acc.credential_data && acc.credential_data.token && acc.credential_data.token.refresh_token);
            // Use authentic live quotas from Google Cloud Code if available, or indicate re-authentication required
            const hasQuota = acc.quotas && acc.quotas.gemini;
            const quotas = hasToken && hasQuota ? acc.quotas : {
              gemini: {
                weekly: { percentage: 0, resetsIn: t.scopes_required || "Reconnexion requise" },
                fiveHour: { percentage: 0, resetsIn: t.scopes_required || "Reconnexion requise" }
              },
              claudeGpt: {
                weekly: { percentage: 0, resetsIn: t.scopes_required || "Reconnexion requise" },
                fiveHour: { percentage: 0, resetsIn: t.scopes_required || "Reconnexion requise" }
              }
            };

            return {
              id: acc.id,
              email: acc.email,
              name: acc.name || acc.alias || acc.email,
              avatarColor: colors[idx % colors.length],
              initials: initials,
              provider: "GOOGLE",
              isActive: isActive,
              hasToken: hasToken,
              statusKey: hasToken ? (isActive ? "active_now" : "connected_windows") : "recently_added",
              lastUsed: isActive ? (t.status_active_now || "Session active") : (hasToken ? (t.card_linked || "Session liée") : (t.scopes_required || "Reconnexion requise")),
              quotas: quotas
            };
          });

          renderAccountsGrid();
        }
      })
      .catch(() => {
        if (window.__TAURI__ && window.__TAURI__.core) {
          window.__TAURI__.core.invoke('get_accounts').then(rawAccounts => {
            if (rawAccounts && Array.isArray(rawAccounts) && rawAccounts.length > 0) {
              state.accounts = rawAccounts.map((a, idx) => ({
                id: a.id,
                email: a.email,
                name: a.name || a.email.split('@')[0],
                avatarColor: a.avatar_color || '#2563eb',
                initials: a.initials || a.email.substring(0, 2).toUpperCase(),
                provider: "GOOGLE",
                isActive: a.is_active,
                hasToken: true,
                statusKey: a.is_active ? "active_now" : "connected_windows",
                lastUsed: a.last_used || "Session liée",
                quotas: {
                  gemini: {
                    weekly: { percentage: a.gemini_quota.weekly.percentage, resetsIn: a.gemini_quota.weekly.resets_in },
                    fiveHour: { percentage: a.gemini_quota.five_hour.percentage, resetsIn: a.gemini_quota.five_hour.resets_in }
                  },
                  claudeGpt: {
                    weekly: { percentage: a.claude_gpt_quota.weekly.percentage, resetsIn: a.claude_gpt_quota.weekly.resets_in },
                    fiveHour: { percentage: a.claude_gpt_quota.five_hour.percentage, resetsIn: a.claude_gpt_quota.five_hour.resets_in }
                  }
                }
              }));
              renderAccountsGrid();
            }
          }).catch(() => {});
        }
      });
  }

  // Initial load
  fetchAndSyncLiveAccounts();

  // Periodic quota telemetry poll every 15s when auto-refresh is active
  setInterval(() => {
    if (state.autoRefreshQuota) {
      fetchAndSyncLiveAccounts();
    }
  }, 15000);
});


