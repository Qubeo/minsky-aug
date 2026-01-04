# Zero-Touch Architecture (Minsky-Aug)

The Zero-Touch architecture is now fully implemented and rebranded. This ensures a clean, maintainable foundation where mods can be developed externally and linked dynamically.

## 🏗️ Architecture Overview

The modding infrastructure is centralized at the root:

*   **`modding/`**: The namespace for all mod-related infrastructure.
    *   **`modding/blueprints/`**: Templates for creating new mods.
    *   **`modding/tools/`**: Automation for installation and config generation.
    *   **`modding/shared/`**: (Optional) Infrastructure shared across local tools.
*   **External Mods**: Mods like `csv-export` now live in their own repository (`minsky-mods`).

## 🛠️ Key Workflows

### 1. Linking a Mod
```bash
node modding/tools/install-mod.js --link /path/to/external/mod
```
This symlinks the external mod into `gui-js/libs/mods` and automatically regenerates the core application config.

### 2. Semantic CSV Mapping
Exports and Imports now use a standardized metadata schema:
`name, units, description, type, value, init`
The import wizard recognizes these headers semantically, so their position doesn't matter.

## ✅ Verification
- **Rebranding**: All strings updated to `Minsky-Aug`.
- **Infrastructure**: `ApplicationMenuManager` and `WindowManager` updated for mod injection.
- **Independence**: `csv-export` mod is 100% self-contained.
