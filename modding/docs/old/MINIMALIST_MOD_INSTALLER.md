# Minimalist Mod Installer Proposal

## 1. Assessment of `PLUGIN_SYSTEM_DESIGN.md`

The existing design document describes a robust **Runtime Plugin System** where compiled bundles are loaded dynamically by the Electron app.

-   **Elegance**: High. It decouples plugins from the core build, allows versioning, and provides a sandboxed API. 
-   **Complexity**: Very High. It requires:
    -   A stable Plugin API exposed by the core.
    -   Dynamic module loading (Webpack Module Federation or SystemJS) which is non-trivial with Angular AOT.
    -   Complex dependency management (sharing Angular/material instances).
-   **Verdict**: This is the correct long-term architectural goal, but it is an expensive engineering project (weeks/months) before the first plugin can ship.

## 2. Recommendation: "Source-Patch" Installer

To enable immediate sharing of the **Scenario Loader** (and similar mods) with the "simplest, least-interventive" user experience, I propose a **Source-Patch Package**.

Instead of a runtime plugin, the mod is distributed as source code with an intelligent `install.js` script that automates the integration steps we performed manually.

### Package Structure (`minsky-aug-scenario-loader.zip`)

```text
minsky-aug-scenario-loader/
├── lib/               # The Angular library (gui-js/libs/mods/mod-scenario-loader content)
├── install.js         # NodeJS installation script
├── uninstall.js       # Reversion script
└── README.md          # Instructions
```

### Installation Workflow

1.  User extracts zip to `mods/downloads/`.
2.  Runs `node mods/downloads/mod-scenario-loader/install.js`.
3.  Script performs:
    -   **Copy**: Moves `lib/` to `gui-js/libs/mods/mod-scenario-loader`.
    -   **JSON Patch**: Adds path mapping to `tsconfig.base.json`.
    -   **AST/Regex Patch**: Injects imports and menu items into `main` and `renderer` files.
4.  User rebuilds Minsky (`npm start` or build).

### Why this is "Minimalist"
-   **Zero Core Refactoring**: No need to build the Plugin Manager or API today.
-   **Native Integration**: The mod runs as first-class code (full access to internals), avoiding API limitations.
-   **Automation**: Removes the risk of users breaking code while manually editing `ApplicationMenuManager.ts`.

## 3. Implementation Plan for `install.js`

The script needs to be robust but simple, using standard Node.js `fs` and string manipulation (regex).

### Key Logic Areas

#### A. `tsconfig.base.json`
Load JSON, add `"@minsky/mod-scenario-loader"` to `compilerOptions.paths` if missing, write JSON.

#### B. `ApplicationMenuManager.ts` (The hardest part)
Use an "Anchor" strategy. Find a known stable menu item and inject before/after it.

```javascript
// Pseudo-code
const anchor = "label: 'Dimensional Analysis'";
const injection = `
        {
          label: 'Load Scenario...',
          click: async () => { ... }
        },`;

if (!content.includes('Load Scenario')) {
  content = content.replace(anchor, `${injection}\n${anchor}`);
}
```

#### C. `simulation.module.ts`
Inject import at the top.
Inject into `imports: [...]` array using regex matching `imports:\s*\[`.

#### D. IPC Hooks
Read `electron.events.ts`, look for `ipcMain.handle`, and append the new handler.

## 4. Path to Execution
1.  Create `install.js` in `mods/mod-scenario-loader/tools/`.
2.  Test it against a clean repo state (using `git stash` or a fresh clone).
3.  Zip up the result for valid distribution.
