# Minsky Modding

Extend Minsky with custom features without touching core code.

## Philosophy

**Zero-Touch**: Mods are self-contained packages that integrate via a registry system. Install a mod, rebuild, done. No manual patching required.

## Quick Start

```bash
# Install a mod (symlink for development)
node modding/tools/install-mod.js --link /path/to/my-mod

# Rebuild Minsky
cd gui-js && npm start
```

## Creating a Mod

1. Create a folder with `manifest.json`:

```json
{
  "id": "my-mod",
  "version": "1.0.0",
  "contributes": {
    "menus": {
      "items": [{ "menu": "simulation", "label": "My Feature", "command": "my-mod.open" }]
    },
    "commands": [{ "id": "my-mod.open", "route": "my-mod", "window": { "width": 600, "height": 400 } }],
    "routes": [{ "path": "my-mod", "module": "MyModModule" }]
  }
}
```

2. Add your source in `src/`:
   - `index.ts` - exports
   - `lib/my-mod.module.ts` - Angular module
   - `lib/my-mod.component.ts` - UI component

3. Install and test:
```bash
node modding/tools/install-mod.js --link /path/to/my-mod
cd gui-js && npm start
```

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - How the modding system works
- [MANIFEST.md](docs/MANIFEST.md) - Complete manifest reference
- [BUILD_SETUP.md](docs/BUILD_SETUP.md) - Building Minsky from source
