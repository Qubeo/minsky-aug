# Zero-Touch Modding Architecture Plan

## Goal
Minimize patches to Minsky core when adding mods. Ideally: drop mod folder, run install, done.

## Current Pain Points
- Each mod patches `tsconfig.base.json` (add path alias)
- Each mod patches `simulation-routing.module.ts` (add route)
- Each mod patches `ApplicationMenuManager.ts` (add menu item)
- Multiple mods = merge conflicts, fragile patches

---

## Proposed Solution

### 1. Mod Registry + Single Hook

**One-time patch to ApplicationMenuManager.ts:**
```typescript
import { ModRegistry } from './ModRegistry';

// Called once after base menu is built
private static async injectModMenuItems(menu: Menu) {
  const modMenuItems = await ModRegistry.loadAllMenuItems();
  for (const item of modMenuItems) {
    const targetMenu = menu.getMenuItemById(item.targetMenu);
    if (targetMenu?.submenu) {
      targetMenu.submenu.append(new MenuItem(item.menuItem));
    }
  }
}
```

**Mod manifest declares menu contributions:**
```json
{
  "id": "mod-csv-export",
  "version": "0.1.0",
  "contributions": {
    "menus": [
      {
        "targetMenu": "simulation",
        "label": "Export Variables CSV",
        "route": "simulation/export-csv",
        "window": { "width": 400, "height": 300 }
      }
    ],
    "routes": [
      { "path": "export-csv", "component": "CsvExportComponent" }
    ]
  }
}
```

### 2. tsconfig.base.json Wildcard

Replace per-mod path aliases with:
```json
"@minsky/mod-*": ["libs/mods/*/src/index.ts"]
```

This requires no patching for new mods.

### 3. Dynamic Route Loading

Instead of patching routing modules, scan `libs/mods/*/manifest.json` at build time or use Angular's lazy loading:

```typescript
// simulation-routing.module.ts - patched ONCE
const modRoutes = ModRegistry.loadRoutes('simulation');
const routes: Routes = [
  { path: 'simulation-parameters', component: SimulationParametersComponent },
  ...modRoutes  // dynamically loaded
];
```

### 4. Mod Discovery

**Option A**: Build-time scan of `mods/` directory
**Option B**: Runtime scan of `libs/mods/*/manifest.json`

Build-time is safer (no runtime surprises), runtime is more flexible.

---

## Implementation Order

1. **tsconfig wildcard** - Trivial, immediate win
2. **ModRegistry class** - Central place to read manifests
3. **Menu injection hook** - Single patch to ApplicationMenuManager
4. **Route injection** - Single patch to routing modules

## Files to Create/Modify (One-Time)

- `gui-js/libs/core/src/lib/ModRegistry.ts` (new)
- `gui-js/tsconfig.base.json` (wildcard path)
- `gui-js/apps/minsky-electron/src/app/managers/ApplicationMenuManager.ts` (add hook)
- `gui-js/libs/menu/src/lib/simulation/simulation-routing.module.ts` (dynamic routes)

## Manifest Schema

```typescript
interface ModManifest {
  id: string;
  version: string;
  description?: string;
  contributions?: {
    menus?: MenuContribution[];
    routes?: RouteContribution[];
  };
}

interface MenuContribution {
  targetMenu: 'file' | 'edit' | 'simulation' | 'options' | 'help';
  label: string;
  route: string;
  window?: { width: number; height: number; title?: string };
  accelerator?: string;
}

interface RouteContribution {
  path: string;
  component: string;
  loadFrom?: string; // e.g. "@minsky/mod-csv-export"
}
```

---

## Not In Scope (For Now)
- Hot-reloading mods without rebuild
- Mod dependencies / load order
- Mod marketplace / versioning
