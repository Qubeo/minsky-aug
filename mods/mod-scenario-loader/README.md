# Mod: Scenario Loader

Load parameter scenarios from CSV files through **Simulation → Load Scenario...** menu.

## Installation

This mod comes with automated install/uninstall scripts.

### To Install (on new Minsky instance)
1. Copy the `mod-scenario-loader` folder to `mods/`.
2. Run from repository root:
   ```bash
   node mods/mod-scenario-loader/install.js
   ```
3. Rebuild/Restart Minsky.

### To Uninstall
1. Run from repository root:
   ```bash
   node mods/mod-scenario-loader/uninstall.js
   ```
   *Note: This restores files from `.bak` versions created during installation.*

## Implementation Location

The actual Angular implementation is in:
```
gui-js/libs/mods/mod-scenario-loader/
```

A symlink to the source is provided here for convenience:
```
mods/mod-scenario-loader/src -> gui-js/libs/mods/mod-scenario-loader/src
```

## Why This Structure?

Angular mods are Nx libraries that integrate with the GUI build system. They must live in `gui-js/libs/` to:
- Share TypeScript path mappings (`@minsky/mod-scenario-loader`)
- Use Angular dependency injection
- Be testable with `nx test mod-scenario-loader`

The `mods/` folder at the repository root contains:
- Documentation and planning (`mods/docs/`)
- Tooling scripts (`mods/tools/`)
- Symlinks to implementations (this folder)

## Documentation

- **Planning Doc**: [SCENARIO_LOADER_PLAN.md](./SCENARIO_LOADER_PLAN.md)
- **Test CSV**: [test-scenario.csv](./test-scenario.csv)
- **Modding Guide**: [MODDING_GUIDE.md](../docs/MODDING_GUIDE.md)

## CSV Format

```csv
Parameter,Units,Description,Conservative,Optimistic,Ideal
InnovationRate,1/year,Rate of innovation,0.02,0.04,0.06
```

| Column | Required | Description |
|--------|----------|-------------|
| Parameter | Yes | Variable name (without `:` prefix) |
| Units | No | Unit string (for documentation) |
| Description | No | Parameter description |
| Scenario1..N | Yes | Numeric values for each scenario |

## Usage

1. **Simulation → Load Scenario...**
2. Select a CSV file
3. Choose scenario from dropdown
4. Preview changes
5. Apply to model

## Files

See implementation in `gui-js/libs/mods/mod-scenario-loader/`:
- `src/lib/scenario-loader.component.ts` - Main wizard UI
- `src/lib/scenario-loader.service.ts` - Business logic
- `src/lib/utils/csv-parser.util.ts` - CSV parsing
- `src/lib/utils/variable-matcher.util.ts` - Variable matching
- `src/lib/dialogs/` - Dialog components
