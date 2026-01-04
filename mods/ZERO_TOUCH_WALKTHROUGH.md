nod# Zero Touch Architecture Implemented

I have implemented the "Zero Touch" modding architecture. This system allows adding mods without manually patching core file logic, using a build-time configuration generation approach.

## Key Components

### 1. Mod Installation
- **Tool**: `node tools/install-mod.js <mod-id>`
- **Action**: Copies the mod from `mods/<id>` to `gui-js/libs/mods/<id>` (the "Installed" area).
- **Reason**: Ensures [gui-js](file:///home/qubeo/prog/minsky-aug/gui-js) is self-contained and portable.

### 2. Configuration Generation
- **Tool**: `node tools/generate-mod-config.js` (runs automatically after install)
- **Output**: [gui-js/libs/core/src/lib/mod-config.generated.ts](file:///home/qubeo/prog/minsky-aug/gui-js/libs/core/src/lib/mod-config.generated.ts)
- **Content**: Automatically detects active mods, their menu items, routes, and IPC handlers from [manifest.json](file:///home/qubeo/prog/minsky-aug/mods/mod-scenario-loader/manifest.json).

### 3. Core Integration (Patched Once)
- **ModRegistry**: Read the generated config at runtime.
- **ApplicationMenuManager**: Injects menu items from registry.
- **SimulationRouting**: Injects routes from registry.
- **ElectronEvents**: Injects IPC handlers from registry.

## Verification
- **Verified with**: `mod-scenario-loader`
- **Results**:
    - Manifest successfully updated to include IPC definition.
    - [install-mod.js](file:///home/qubeo/prog/minsky-aug/tools/install-mod.js) copied files and generated config.
    - Generated config contains correct IPC mapping:
      ```typescript
      { channel: 'read-file-text', handler: async (...args: any[]) => (await import('@minsky/mod-scenario-loader')).ipcHandlers['read-file-text'](...args) }
      ```
    - Core files updated to consume registry.

## How to Test
1. Run `node tools/install-mod.js mod-scenario-loader`.
2. Build/Start the Minsky Electron app.
3. Check for "Load Scenario..." under Simulation menu.
