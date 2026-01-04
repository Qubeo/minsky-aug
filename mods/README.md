# Minsky Modding Infrastructure

**Welcome to the clean, organized space for Minsky modifications!**

This directory contains everything you need to create, manage, and distribute mods for Minsky.

---

## 📁 Directory Structure

```
mods/
├── README.md               ← You are here
├── docs/                   ← Documentation
│   ├── DEV_WORKFLOW.md     ← **Start Here** (Development Guide)
│   ├── CONTENT_GUIDE.md    ← Writing style & formatting
│   ├── MODDING_GUIDE.md    ← General modding concepts
│   └── MINIMALIST_MOD_INSTALLER.md ← Installer architecture
│
├── mod-scenario-loader/    ← **Active Mod Source**
│   ├── src/                ← Angular source files
│   ├── install.js          ← Installer script
│   ├── uninstall.js        ← Uninstaller script
│   └── BASE_CHANGES.md     ← Patches documentation
│
└── tools/                  ← Utility scripts
```

---

## 🚀 Quick Start

### 1. Understanding the Workflow
We use a **Source-Patch** architecture.
-   **Develop** in `mods/<mod-name>/`.
-   **Install** to Minsky via `install.js` (Copies files).
-   **Distribute** as a zip file with an `install.js` script.

> Read [DEV_WORKFLOW.md](docs/DEV_WORKFLOW.md) for the complete guide.

### 2. Creating a New Mod
1.  Create a directory `mods/mod-my-feature`.
2.  Add your source code in `src/`.
3.  Write `install.js` to handle distribution:
    -   Copy `src/` to `gui-js/libs/mods/mod-my-feature`.
    -   Apply patches to core files.


### 3. Installing Mods (Consumer)
If you received a mod package:
1.  Unzip it to `mods/`.
2.  Run `node mods/mod-name/install.js`.
3.  Rebuild Minsky.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [DEV_WORKFLOW.md](docs/DEV_WORKFLOW.md) | **Primary Guide**: How to set up, develop, and release mods. |
| [MINIMALIST_MOD_INSTALLER.md](docs/MINIMALIST_MOD_INSTALLER.md) | Explanation of the `install.js` system. |
| [MODDING_GUIDE.md](docs/MODDING_GUIDE.md) | General guide to creating mods. |
| [BUILD_SETUP.md](docs/BUILD_SETUP.md) | Compiling Minsky on Linux. |
| [GIT_WORKFLOW_QUICKREF.md](docs/GIT_WORKFLOW_QUICKREF.md) | Branching and merging specific to this repo. |

---

## 🎯 Philosophy

1.  **Separation of Concerns**: Mod source code lives here, isolated from the complex Minsky core history.
2.  **Zero-Touch Core**: We avoid modifying core files directly whenever possible. When necessary, we use scripts (`install.js`) to apply patches safely.
3.  **Portability**: Mods are self-contained packages that can be installed on any Minsky instance.

---

## 🤝 Contributing

**All modding work happens on `dev` or `mod/*` branches.**

### Workflow Summary
1.  **Branch**: `git checkout -b mod/my-feature`
2.  **Code**: Work in `mods/mod-my-feature/`
3.  **Test**: Verified via `node install.js` and `npm start`
4.  **Document**: Update `README.md` and `BASE_CHANGES.md` inside your mod folder.

---

## 🔗 Links
- **Original Repo**: https://github.com/highperformancecoder/minsky
- **Your Fork**: https://github.com/Qubeo/minsky-mod
- **Minsky Website**: http://minsky.sf.net

---

**Happy Modding!** 🎉
