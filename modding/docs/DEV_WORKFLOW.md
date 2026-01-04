# Mod Development Workflow

## Philosophy
We maintain a strict separation between **Mod Source** and **Core Application**.
-   **Source of Truth**: `mods/` directory (or external repo).
-   **Source of Truth**: `mods/` directory (or external repo).
-   **Build Integration**: `gui-js/libs/mods/` (Copied via installer).

## Git Workflow

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

## Structure
```
repo/
├── mods/mod-scenario-loader/       <-- WORK HERE
│   ├── src/                        <-- Source code (Components, Services)
│   ├── install.js                  <-- Installer script
│   ├── BASE_CHANGES.md             <-- Documentation of core patches
│   └── README.md
│
└── gui-js/libs/mods/mod-scenario-loader  <-- COPIED SOURCE
    └── (updated by install.js)
```

## How to Develop
1.  Open `mods/mod-scenario-loader` in your editor.
2.  Make changes to files in `src/`.
3.  Run `node install.js` to propagate changes to `gui-js/libs/mods/`.
4.  Run `npm start` in `gui-js` to test.

## How to Release
1.  Ensure `install.js` and `uninstall.js` are up to date.
2.  Zip the `mods/mod-scenario-loader` folder.
3.  Distribute the zip.

## How to Install (Consumer)
1.  Unzip.
2.  Run `node install.js`.
3.  This *copies* the files (breaking the link to your source) and patches the core.

## Maintenance
-   **Core Updates**: If Minsky core changes, verify `BASE_CHANGES.md` and `install.js` logic (especially regex hooks).
-   **New Hooks**: If you need new hooks in Minsky, implement them in core first, document in `BASE_CHANGES.md`, and update `install.js`.
