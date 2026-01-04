# Minsky Modding Guide

## Overview
This guide describes the recommended workflow for creating clean, modular modifications to Minsky.

---

## Architecture Summary

**Stack:** Angular 20 + Electron 37 + C++ Backend
**Build System:** Nx Monorepo
**Package Manager:** npm
**TypeScript Version:** 5.8.3

**Key Libraries:**
- `/libs/core` - Services (ElectronService, CommunicationService)
- `/libs/shared` - Backend proxies, constants, interfaces
- `/libs/ui-components` - 30+ standalone UI components
- `/libs/menu` - Feature-based menu modules

---

## Modding Principles

### The 5 Pillars of Clean Mods:
1. **Self-Contained** - Each mod is an isolated Nx library
2. **Minimally Invasive** - Changes to base code are documented and minimal
3. **Well-Documented** - Each mod has README, comments, and changelog
4. **Reversible** - Easy to enable/disable without breaking the app
5. **Upstream-Friendly** - Easy to merge upstream changes

---

## Setup: Git Workflow

### Initial Setup
```bash
# Add upstream remote (original repo)
git remote add upstream https://github.com/Qubeo/minsky-aug.git

# Create your fork on GitHub, then:
git remote add mymods git@github.com:YourUsername/minsky-aug.git

# Fetch all remotes
git fetch --all
```

### Branch Structure
```
main              ← Tracks upstream, NEVER modify directly
└── dev           ← Your integration branch
    ├── mod/custom-widgets
    ├── mod/better-plots
    └── mod/export-enhancements
```

### Daily Workflow
```bash
# Create a new mod
git checkout dev
git checkout -b mod/my-feature

# Work on your mod...
# Commit frequently with clear messages

# Merge into dev when ready
git checkout dev
git merge mod/my-feature

# Keep main updated from upstream
git checkout main
git pull upstream main

# Rebase dev on top of main to get updates
git checkout dev
git rebase main
```

---

## Creating a New Mod

### Step 1: Generate Nx Library

```bash
cd gui-js

# Generate a new library for your mod
npx nx generate @nx/js:library mod-my-feature --directory=libs/mods/mod-my-feature

# This creates:
# /libs/mods/mod-my-feature/
#   ├── src/
#   │   ├── index.ts
#   │   └── lib/
#   ├── project.json
#   ├── tsconfig.json
#   ├── tsconfig.lib.json
#   └── README.md
```

### Step 2: Add Path Alias

Edit `gui-js/tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@minsky/core": ["libs/core/src/index.ts"],
      "@minsky/shared": ["libs/shared/src/index.ts"],
      "@minsky/ui-components": ["libs/ui-components/src/index.ts"],
      "@minsky/menu": ["libs/menu/src/index.ts"],
      "@minsky/mod-my-feature": ["libs/mods/mod-my-feature/src/index.ts"]  // ← ADD THIS
    }
  }
}
```

### Step 3: Document Your Mod

Create `/libs/mods/mod-my-feature/README.md`:

```markdown
# Mod: My Feature

## Purpose
Brief description of what this mod does.

## Changes to Base Code
List any files outside this library that were modified:
- `/apps/minsky-web/src/app/app.component.ts` - Added import on line 42
- `/libs/shared/src/lib/constants/constants.ts` - Added MY_EVENT constant

## Installation
\`\`\`bash
# Install dependencies (if any)
npm install --save my-dependency

# Enable the mod in app.component.ts
import { MyFeatureService } from '@minsky/mod-my-feature';
\`\`\`

## Usage
How to use the mod...

## Configuration
Any configuration options...

## Testing
\`\`\`bash
npx nx test mod-my-feature
\`\`\`

## Author
Your Name - Date

## Changelog
- v1.0.0 (2026-01-04) - Initial version
```

### Step 4: Track Base Code Changes

Create `/libs/mods/mod-my-feature/BASE_CHANGES.md`:

```markdown
# Changes to Base Minsky Code

This mod requires the following minimal changes to base code:

## Files Modified

### `/apps/minsky-web/src/app/app.component.ts`
**Line 42** - Added import:
\`\`\`typescript
import { MyFeatureService } from '@minsky/mod-my-feature';
\`\`\`

**Line 87** - Inject service:
\`\`\`typescript
constructor(private myFeature: MyFeatureService) { }
\`\`\`

**Rationale:** Needed to initialize the feature service on app start.

---

### `/libs/shared/src/lib/constants/constants.ts`
**Line 156** - Added event constant:
\`\`\`typescript
MY_CUSTOM_EVENT: 'my-custom-event',
\`\`\`

**Rationale:** New IPC event for communication with backend.

---

## Reverting Changes

To disable this mod:
1. Remove imports from app.component.ts
2. Remove event constant from constants.ts
3. Remove library from package dependencies
```

---

## Mod Types & Patterns

### Type 1: UI Component Mods

**Use Case:** Add new widgets, panels, or visualizations

**Pattern:**
```typescript
// /libs/mods/mod-custom-widget/src/lib/custom-widget.component.ts
import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-custom-widget',
  template: `<div>My Custom Widget</div>`,
  standalone: true,
})
export class CustomWidgetComponent {
  constructor(private electron: ElectronService) {}

  async loadData() {
    const data = await this.electron.minsky.canvas.getItemAt(10, 20);
    // Process data...
  }
}
```

**Export:**
```typescript
// /libs/mods/mod-custom-widget/src/index.ts
export * from './lib/custom-widget.component';
```

**Use:**
```typescript
// In any Angular component
import { CustomWidgetComponent } from '@minsky/mod-custom-widget';

@Component({
  imports: [CustomWidgetComponent],
  template: `<minsky-custom-widget />`
})
```

---

### Type 2: Service Mods

**Use Case:** Add new functionality, data processing, integrations

**Pattern:**
```typescript
// /libs/mods/mod-analytics/src/lib/analytics.service.ts
import { Injectable } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private electron: ElectronService) {}

  async trackSimulation() {
    const state = await this.electron.minsky.running();
    console.log('Simulation running:', state);
  }
}
```

**Use:**
```typescript
// Inject anywhere
constructor(private analytics: AnalyticsService) {
  this.analytics.trackSimulation();
}
```

---

### Type 3: Event Handler Mods

**Use Case:** React to existing events with custom logic

**Pattern:**
```typescript
// /libs/mods/mod-auto-save/src/lib/auto-save.service.ts
import { Injectable } from '@angular/core';
import { CommunicationService } from '@minsky/core';
import { events } from '@minsky/shared';

@Injectable({ providedIn: 'root' })
export class AutoSaveService {
  constructor(private comm: CommunicationService) {
    this.setupListeners();
  }

  private setupListeners() {
    // Listen to existing events
    this.comm.getBackEndMessages().subscribe(msg => {
      if (msg.event === 'SIMULATION_STEP') {
        this.checkAutoSave();
      }
    });
  }

  private async checkAutoSave() {
    // Auto-save logic...
  }
}
```

---

### Type 4: Menu Extension Mods

**Use Case:** Add new menu items or context menu options

**Pattern:**
```typescript
// /libs/mods/mod-export-menu/src/lib/export-menu.component.ts
import { Component } from '@angular/core';
import { ElectronService } from '@minsky/core';

@Component({
  selector: 'minsky-export-menu',
  template: `
    <button (click)="exportToPDF()">Export to PDF</button>
    <button (click)="exportToCSV()">Export to CSV</button>
  `,
  standalone: true,
})
export class ExportMenuComponent {
  constructor(private electron: ElectronService) {}

  async exportToPDF() {
    // Custom export logic
  }
}
```

**Add to routing:**
```typescript
// In app-routing.module.ts
{
  path: 'headless/menu/export',
  loadChildren: () => import('@minsky/mod-export-menu').then(m => m.ExportMenuModule)
}
```

---

## Best Practices

### 1. **Naming Convention**
- Library: `mod-feature-name`
- Components: `FeatureNameComponent`
- Services: `FeatureNameService`
- Path alias: `@minsky/mod-feature-name`

### 2. **Documentation Standards**
Each mod must have:
- ✅ `README.md` - Purpose, usage, installation
- ✅ `BASE_CHANGES.md` - All changes to base code
- ✅ `CHANGELOG.md` - Version history
- ✅ Inline comments for complex logic

### 3. **Commit Message Format**
```
[mod-feature-name] Brief description

Longer explanation if needed.

Changes:
- Added X component
- Modified Y service
- Fixed Z bug

Base code changes:
- app.component.ts: Added import (line 42)
```

### 4. **Testing**
```bash
# Test your mod
npx nx test mod-feature-name

# Lint your mod
npx nx lint mod-feature-name

# Build your mod
npx nx build mod-feature-name
```

### 5. **Version Control**
- One mod = one branch (`mod/feature-name`)
- Squash commits when merging to `dev`
- Tag releases: `mod-feature-name-v1.0.0`

### 6. **Configuration Over Code**
Prefer configuration files for mod settings:

```typescript
// /libs/mods/mod-my-feature/src/lib/config.ts
export const MOD_CONFIG = {
  enabled: true,
  autoRun: false,
  interval: 5000,
  // Load from external file if needed
};
```

---

## Managing Multiple Mods

### Mod Registry (Optional)

Create `/libs/mods/mod-registry.ts`:

```typescript
// Central registry of all mods
export const MOD_REGISTRY = {
  'custom-widgets': {
    enabled: true,
    library: '@minsky/mod-custom-widgets',
    version: '1.0.0',
  },
  'analytics': {
    enabled: false,
    library: '@minsky/mod-analytics',
    version: '0.5.0',
  },
  // Add more mods here...
};
```

### Conditional Loading

```typescript
// In app.component.ts
import { MOD_REGISTRY } from '@minsky/mods/mod-registry';

ngOnInit() {
  // Load enabled mods dynamically
  Object.entries(MOD_REGISTRY).forEach(([name, config]) => {
    if (config.enabled) {
      import(config.library).then(mod => {
        console.log(`Loaded mod: ${name}`);
        // Initialize mod...
      });
    }
  });
}
```

---

## Example: Complete Mod Workflow

### Scenario: Add a "Data Export to Excel" feature

```bash
# 1. Create branch
git checkout dev
git checkout -b mod/excel-export

# 2. Generate library
cd gui-js
npx nx generate @nx/js:library mod-excel-export --directory=libs/mods/mod-excel-export

# 3. Add dependencies
npm install --save xlsx

# 4. Create service
# (Code in /libs/mods/mod-excel-export/src/lib/excel-export.service.ts)

# 5. Add to tsconfig paths
# (Edit tsconfig.base.json)

# 6. Document changes
# (Create README.md, BASE_CHANGES.md)

# 7. Test
npx nx test mod-excel-export

# 8. Commit
git add .
git commit -m "[mod-excel-export] Add Excel export functionality

Added service to export simulation data to Excel format.

Changes:
- Created ExcelExportService
- Added xlsx dependency

Base code changes:
- None (fully self-contained)
"

# 9. Merge to dev
git checkout dev
git merge mod/excel-export

# 10. Tag release
git tag mod-excel-export-v1.0.0
git push mymods dev --tags
```

---

## Upstream Sync Strategy

### Monthly Sync (Recommended)

```bash
# 1. Update main from upstream
git checkout main
git pull upstream main

# 2. Rebase dev
git checkout dev
git rebase main

# 3. Handle conflicts in mod code
# - Resolve conflicts
# - Update BASE_CHANGES.md if base files changed
# - Re-test mods

# 4. Push to your fork
git push mymods dev --force-with-lease
```

### When Upstream Changes Break Your Mod

1. **Identify the breaking change** (check upstream commits)
2. **Update BASE_CHANGES.md** with new file locations/signatures
3. **Fix mod code** to work with new upstream version
4. **Bump mod version** (e.g., 1.0.0 → 1.1.0)
5. **Document in CHANGELOG.md**

---

## Tools & Commands

### Nx Dependency Graph
```bash
cd gui-js
npx nx graph
# Opens browser showing all library dependencies
```

### List All Mods
```bash
npx nx list @nx/js
# Shows all libraries
```

### Affected Mods (after upstream merge)
```bash
npx nx affected:test
# Tests only libraries affected by changes
```

### Build All Mods
```bash
npx nx run-many --target=build --projects=mod-*
```

---

## FAQ

### Q: Should I fork or branch?
**A:** Both! Fork on GitHub (for backup/sharing), but use branches locally for organization.

### Q: How do I share mods with others?
**A:** Push your `mod/*` branches to your fork. Others can cherry-pick them:
```bash
git fetch https://github.com/YourUsername/minsky-aug.git mod/feature-name
git cherry-pick FETCH_HEAD
```

### Q: Can I modify C++ backend?
**A:** Yes, but it's more invasive. Document changes carefully in `BASE_CHANGES.md` and consider using the TypeScript proxy pattern instead.

### Q: How do I disable a mod temporarily?
**A:** Comment out imports/injections in base code, or use the MOD_REGISTRY pattern with `enabled: false`.

### Q: Should mods be in separate repos?
**A:** For public distribution, yes. For personal use, Nx libraries in the monorepo are cleaner.

---

## Additional Resources

- [Nx Documentation](https://nx.dev)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [Electron IPC](https://www.electronjs.org/docs/latest/api/ipc-renderer)
- Minsky Architecture: See `/Architecture.md`
- Minsky File Structure: See `/File structure.md`

---

**Version:** 1.0.0
**Last Updated:** 2026-01-04
**Author:** Claude (AI Assistant)
