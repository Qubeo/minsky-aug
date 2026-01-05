# Minsky Modding Infrastructure

**Welcome to the clean, organized space for Minsky modifications!**

This directory contains the tools and documentation to create, manage, and distribute mods for Minsky following the **Zero-Touch** philosophy.

---

## 📁 Directory Structure

```
modding/
├── README.md               ← You are here
├── docs/                   ← Documentation
│   ├── ZERO_TOUCH_MODDING.md ← **Start Here** (Architecture & Guide)
│   └── old/                ← Legacy documentation (Archived)
│
├── tools/                  ← Utility scripts
│   ├── install-mod.js      ← **Unified Installer** (Zero-Touch)
│   ├── generate-mod-config.js ← Build-time config generator
│   └── create-mod.sh       ← Mod skeleton generator
│
└── blueprints/             ← Reference implementations
```

---

## 🚀 Quick Start

### 1. Understanding the Workflow
We use a **Zero-Touch** registry-based architecture.
-   **Develop** mods in isolated folders (e.g., in `minsky-mods/`).
-   **Install** to Minsky via the unified installer:
    ```bash
    node modding/tools/install-mod.js --link /path/to/your-mod
    ```
-   **Build** Minsky normally. The mod is automatically discovered and integrated.

> Read [ZERO_TOUCH_MODDING.md](docs/ZERO_TOUCH_MODDING.md) for the complete guide.

### 2. Creating a New Mod
1.  Use the helper script:
    ```bash
    ./modding/tools/create-mod.sh my-feature
    ```
2.  Follow the instructions in the output to register and develop your mod.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [ZERO_TOUCH_MODDING.md](docs/ZERO_TOUCH_MODDING.md) | **Primary Guide**: Architecture, manifest schema, and workflow. |
| [BUILD_SETUP.md](docs/BUILD_SETUP.md) | Compiling Minsky on Linux. |

---

## 🎯 Philosophy

1.  **Zero-Touch Core**: We avoid modifying core files. Integration happens via registry lookups in pre-patched hooks.
2.  **Isolated Development**: Mods live outside the main Minsky source tree, making them easy to share and version.
3.  **Reproducible**: Configuration is auto-generated at build time from `manifest.json` files.

---

## 🔗 Links
- **Minsky Repository**: https://github.com/highperformancecoder/minsky
- **Minsky Website**: http://minsky.sf.net

---

**Happy Modding!** 🎉
