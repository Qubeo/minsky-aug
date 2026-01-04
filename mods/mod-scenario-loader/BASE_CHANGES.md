# Base Code Changes for mod-scenario-loader

## Files Modified

### tsconfig.base.json
Added path mapping for `@minsky/mod-scenario-loader`

### libs/menu/src/lib/simulation/simulation-routing.module.ts
Added route: `{ path: 'load-scenario', component: ScenarioLoaderComponent }`

### libs/menu/src/lib/simulation/simulation.module.ts
Added import: `ScenarioLoaderComponent`

### apps/minsky-electron/src/app/managers/ApplicationMenuManager.ts
Added menu item "Load Scenario..." in `getSimulationMenu()`

## Reverting
1. Remove path from tsconfig.base.json
2. Remove route from simulation-routing.module.ts
3. Remove import from simulation.module.ts
4. Remove menu item from ApplicationMenuManager.ts

## Performance Investigation
To diagnose slow variable loading (equations/summary), we have instrumented the mod with `console.time()` logging:
- `Minsky:variableValues.summarise`: Measures backend response time for fetching all variables.
- `Mod:VariableMatcher.processing`: Measures local processing time.
- `Mod:createMissingVariables`: Measures time to create and position variables on canvas.

These logs appear in the Electron Developer Tools console.

## Performance Optimization (Experimental)
A new optimization has been implemented to address performance issues with large models (many variables).
- **Issue**: `variableValues.summarise()` fetches the entire state of all variables, causing massive IPC overhead and hanging the UI.
- **Solution**: We now use `variableValues.keys()` to check for existence (names only) and `variableValues.elem(name)` to fetch details for *only* the mapped variables.
- **Result**: Data transfer reduced from O(AllVars) to O(CsvColumns).
- **Usage**: Run `node mods/mod-scenario-loader/install-opt.js` to apply this optimization.
