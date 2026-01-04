# Mod: Scenario Loader

Load parameter scenarios from CSV files through **Simulation → Load Scenario...** menu.

## Features
- Parse CSV with parameter columns (Conservative, Optimistic, etc.)
- Auto-match variable names (with/without `:` prefix)
- Preview changes before applying
- Create missing variables as global parameters

## CSV Format
```csv
Parameter,Conservative,Optimistic,Ideal
InnovationRate,0.02,0.04,0.06
ChurnRate,0.6,0.5,0.4
```

## Installation
Path mapping in `tsconfig.base.json`:
```json
"@minsky/mod-scenario-loader": ["libs/mods/mod-scenario-loader/src/index.ts"]
```

## Author
Created 2026-01-04
