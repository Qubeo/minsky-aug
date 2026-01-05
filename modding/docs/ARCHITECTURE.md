# Modding Architecture

## Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   manifest.json │────▶│  install-mod.js  │────▶│  Minsky Build   │
│   + src/        │     │  + config gen    │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       Mod                   Installer              Application
```

## Core Components

### 1. Manifest (`manifest.json`)

Declares what the mod contributes:
- **Menus**: New menu items or entire top-level menus
- **Commands**: Actions triggered by menus (with window configs)
- **Routes**: Angular routes for mod UI
- **IPC**: Backend communication channels

### 2. Config Generator (`tools/generate-mod-config.js`)

Scans `gui-js/libs/mods/*/manifest.json` and generates:
- `mod-config.frontend.generated.ts` - menus, commands, routes
- `mod-config.backend.generated.ts` - IPC handlers

### 3. ModRegistry (`gui-js/libs/shared/src/lib/modding/ModRegistry.ts`)

Runtime interface for accessing mod contributions:
```typescript
ModRegistry.getTopLevelMenus()  // New menus to create
ModRegistry.getMenuItems()      // Items to add to menus
ModRegistry.getCommand(id)      // Get command by ID
ModRegistry.getRoutes()         // Angular routes
```

### 4. Integration Hooks

**ApplicationMenuManager.ts**:
- Creates top-level menus from `getTopLevelMenus()`
- Adds menu items via `getMenuItems()` + `getCommand()`

**Routing**:
- `modRoutes` spread into Angular router config

**IPC**:
- `modIpcHandlers` registered in Electron main process

## File Locations

```
minsky-aug/
├── modding/
│   ├── manifest.schema.json          # JSON Schema for validation
│   └── tools/
│       ├── install-mod.js            # Mod installer
│       └── generate-mod-config.js    # Config generator
│
└── gui-js/libs/
    ├── mods/                         # Installed mods live here
    │   └── {mod-id}/
    │       ├── manifest.json
    │       └── src/
    │
    └── shared/src/lib/modding/
        ├── ModRegistry.ts            # Runtime registry
        ├── mod-config.frontend.generated.ts
        └── mod-config.backend.generated.ts
```

## Path Resolution

`tsconfig.base.json` uses a wildcard:
```json
"@minsky/*": ["libs/mods/*/src/index.ts"]
```

This allows importing mods as `@minsky/my-mod` without per-mod config.
