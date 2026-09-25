# 🪐 Antigravity Manager

<div align="center">
  <img src="app_icon.svg" width="128" height="128" alt="Antigravity Manager Logo" />
  <p align="center">
    <strong>Gestionnaire de flotte multi-comptes et moniteur de quotas en temps réel pour Google Antigravity.</strong>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white" alt="Windows" />
    <img src="https://img.shields.io/badge/Framework-Tauri%20v2-24C8DB?logo=tauri&logoColor=white" alt="Tauri" />
    <img src="https://img.shields.io/badge/Backend-Rust-black?logo=rust&logoColor=white" alt="Rust" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License" />
  </p>
</div>

---

## ✨ Fonctionnalités Clés

- **⚡ Bascule Instantanée de Session :** Permutation de compte à chaud dans Antigravity avec réinjection transparente des tokens dans le Windows Credential Manager (`gemini:antigravity`) et redémarrage propre de l'IDE.
- **📊 Télémétrie en Direct (Cloud Code API) :** Surveillance automatique des quotas (Gemini Pro, Gemini Flash, Claude 3.5 Sonnet) pour **tous** vos comptes configurés, même ceux non connectés à l'instant T.
- **🔄 Auto-Switch Intelligent :** Bascule automatique vers le compte disposant du plus grand quota dès que la limite active passe sous 5%.
- **🌐 Authentification Google OAuth 2.0 en 1 Clic :** Connexion directe via le flux officiel Google Cloud Code (`accounts.google.com`) avec enregistrement persistant et rafraîchissement automatique des jetons.
- **🔒 Sécurité & Zéro Fuite :** Stockage sécurisé localement sur votre disque. Aucun token n'est jamais envoyé à un serveur tiers.
- **🎨 Interface Moderne :** Thème Sombre/Clair soigné, fenêtre frameless ultra-réactive conçue avec Tailwind CSS et Tauri v2.

---

## 📥 Téléchargement & Installation

Rendez-vous dans la section **[Releases](../../releases)** pour télécharger la dernière version :

| Fichier | Description |
| :--- | :--- |
| **`AntigravityManager-Setup.exe`** | **Installeur recommandé** pour Windows (raccourcis bureau, menu Démarrer et désinstalleur propre). |
| **`AntigravityManager.exe`** | Version **portable autonome** (sans installation requise, lancez et utilisez directement). |

---

## 🛠️ Architecture Technique

```text
antigravity-manager/
├── src-tauri/             # Backend natif Rust ultra-léger et rapide
│   ├── src/
│   │   ├── main.rs        # Point d'entrée Tauri & gestion des fenêtres
│   │   └── proxy.rs       # Serveur HTTP local, OAuth, polling quotas & rotation
│   ├── icons/             # Déclinaisons officielles de l'icône Windows (.ico, .png)
│   ├── Cargo.toml         # Dépendances Rust (Axum, Tokio, Tauri v2)
│   └── tauri.conf.json    # Configuration du bundle et installeur NSIS
├── dist/                  # Frontend Web embarqué
│   ├── index.html         # Vue UI frameless
│   ├── app.js             # Moteur réactif et communication IPC Tauri
│   ├── styles.css         # Thèmes & animations
│   └── app_icon.svg       # Logo vectoriel officiel
├── AntigravityManager-Setup.exe  # Installeur NSIS prêt à l'emploi
└── AntigravityManager.exe        # Binaire portable autonome
```

---

## 💻 Compilation depuis les sources

### Prérequis
1. [Rust](https://rustup.rs/) (version stable récente)
2. [Tauri CLI](https://tauri.app/) : `cargo install tauri-cli`

### Étapes de build

```powershell
# Cloner le dépôt
git clone https://github.com/VOTRE_PSEUDO/antigravity-manager.git
cd antigravity-manager

# Compiler l'exécutable portable et l'installeur Windows Setup (NSIS)
cargo tauri build --bundles nsis
```

Les exécutables générés se trouveront dans `src-tauri/target/release/`.

---

## 🔒 Confidentialité & Sécurité

- Tous les jetons d'accès et rafraîchissements (`refresh_token`) restent **strictement confinés** sur votre machine locale.
- Le serveur local écoute uniquement sur l'adresse loopback `127.0.0.1:8045`.
- Le fichier `.gitignore` protège par défaut vos sessions locales (`accounts.json`) pour éviter tout commit accidentel.

---

## 📄 Licence

Ce projet est sous licence MIT. Libre d'utilisation et de distribution.
