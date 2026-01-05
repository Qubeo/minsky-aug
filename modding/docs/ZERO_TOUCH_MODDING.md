# Zero-Touch Modding Architecture

## Philosophy
The "Zero-Touch" architecture ensures that adding a modification to Minsky touches the least possible files of the base installation. Instead of manually patching core files, mods are registered through a automated discovery system and injected into the application via well-defined hooks.

## Core Mechanisms

### 1. The Registry System
Mods are discovered through a `manifest.json` file in their root directory. A tool (`generate-mod-config.js`) scans the `libs/mods` directory and generates two configuration files that the core application imports:
- **Frontend**: `gui-js/libs/shared/src/lib/modding/mod-config.frontend.generated.ts` (Routes and Menu items)
- **Backend**: `gui-js/libs/shared/src/lib/modding/mod-config.backend.generated.ts` (IPC Handlers)

### 2. Integration Hooks
The core Minsky application contains "one-time" patches that listen to the `ModRegistry`:
- **Menus**: `ApplicationMenuManager.ts` iterates over `ModRegistry.getMenuContributions()` to append items.
- **Routing**: `simulation-routing.module.ts` spreads `ModRegistry.getRoutes()` into the Angular router.
- **IPC**: `electron.events.ts` registers handlers from the generated backend config.

### 3. Path Mapping
`tsconfig.base.json` uses a wildcard mapping:
```json
"@minsky/*": ["libs/mods/*/src/index.ts"]
```
This allows mods to be imported using semantic names (e.g., `@minsky/mod-scenario-loader`) without updating the core configuration per mod.

## Installation Workflow

To install a mod, use the unified installer in the `minsky-aug` repository:

```bash
# Recommended for development (symlinks the mod)
node modding/tools/install-mod.js --link /path/to/my-mod

# For production/distribution (copies the mod)
node modding/tools/install-mod.js /path/to/my-mod
```

### What `install-mod.js` does:
1.  **Copies/Links** the mod source into `gui-js/libs/mods/<mod-id>`.
2.  **Runs** `generate-mod-config.js` to update the registry files.
3.  **No manual patching** of core `.ts` or `.json` files is required.

## Creating a Mod

1.  **Skeleton**: Create a directory with a `manifest.json`.
2.  **Manifest**:
    ```json
    {
      "id": "my-mod",
      "version": "1.0.0",
      "contributions": {
        "menus": [{ "targetMenu": "simulation", "label": "My Feature", "route": "my-route" }],
        "routes": [{ "path": "my-route", "moduleName": "MyModModule" }]
      }
    }
    ```
3.  **Source**: Implement your logic in `src/`.
4.  **Test**: Run the installer and rebuild Minsky.
