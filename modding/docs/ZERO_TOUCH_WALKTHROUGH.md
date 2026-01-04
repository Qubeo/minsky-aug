# Zero-Touch Modding Architecture: Final Consolidation

The Zero-Touch architecture is now fully consolidated, restructured, and synchronized across branches. This ensures a clean, maintainable foundation for Minsky modding without manual code changes to the core application.

## 🏗️ Architecture Overview

The modding ecosystem has been moved to a dedicated `modding/` namespace at the root:

*   **`modding/blueprints/`**: Standardized templates like `starter-mod` for new developers.
*   **`modding/docs/`**: Comprehensive guides, plans, and technical walkthroughs.
*   **`modding/tools/`**: Automation scripts for installation (`install-mod.js`) and config generation (`generate-mod-config.js`).
*   **`modding/mods/`**: Functional plugins like `scenario-loader` and `csv-export`.

## 🌳 Branch Synchronization Strategy

We have established two key tiers for the ecosystem:

### 1. Source of Truth (`mod/scenario-loader`) -> [GOTO](file:///home/qubeo/prog/minsky-mod/modding/mods/scenario-loader)
Contains the **entire** ecosystem, including functional mods. This is where active feature development occurs.
- ✅ All large binaries (`*.so`, `typescriptAPI`) purged.
- ✅ All mods standardized to the same Zero-Touch protocol.
- ✅ Build-breaking `readFileText` type issues resolved in `ScenarioLoaderService`.

### 2. Infrastructure Baseline (`mod/zero-touch`) -> [GOTO](file:///home/qubeo/prog/minsky-mod/modding/docs)
A pristine, mod-free baseline designed for merging into the main development branch.
- ✅ Contains all **Infrastucture** (tools, registry, core hooks).
- ✅ Contains all **Documentation** and **Blueprints**.
- ✅ **Functional mods** are ignored by Git (`.gitignore`) on this branch, preventing specific plugin code from polluting the core repo.

## ✅ Verification Results

- **Dynamic Deployment**: `node modding/tools/install-mod.js scenario-loader` successfully deploys and registers the mod.
- **IPC Isolation**: IPC handlers are lazy-imported via direct paths, successfully avoiding Angular/Main-process leaks and `PlatformLocation` JIT errors.
- **Build Integrity**: The repo is free of binary bloat, and `npm start` builds correctly with independent mod route/menu injection.

> [!TIP]
> To create a new mod, use the blueprint: [starter-mod](file:///home/qubeo/prog/minsky-mod/modding/blueprints/starter-mod).
