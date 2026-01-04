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
