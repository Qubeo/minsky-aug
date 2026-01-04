# Minsky Modding Infrastructure

**Welcome to the clean, organized space for Minsky modifications!**

This directory contains everything you need to create, manage, and distribute mods for Minsky, completely separate from the original repository structure.

---

## 📁 Directory Structure

```
mods/
├── README.md           ← You are here
├── docs/              ← Documentation
│   ├── BUILD_SETUP.md
│   ├── MODDING_GUIDE.md
│   ├── PLUGIN_SYSTEM_DESIGN.md
│   └── GIT_WORKFLOW_QUICKREF.md
├── tools/             ← Scripts and utilities
│   └── create-mod.sh
└── libs/              ← Symlink to gui-js/libs/mods (actual mod code)
    ├── mod-example/
    └── mod-*/
```

---

## 🚀 Quick Start

### 1. Read the Guides

- **New to modding?** Start with [`docs/MODDING_GUIDE.md`](docs/MODDING_GUIDE.md)
- **Need to build?** See [`docs/BUILD_SETUP.md`](docs/BUILD_SETUP.md)
- **Git workflow?** Check [`docs/GIT_WORKFLOW_QUICKREF.md`](docs/GIT_WORKFLOW_QUICKREF.md)
- **Want plugins?** Read [`docs/PLUGIN_SYSTEM_DESIGN.md`](docs/PLUGIN_SYSTEM_DESIGN.md)

### 2. Create Your First Mod

```bash
# From the repository root
./mods/tools/create-mod.sh my-feature

# This creates: gui-js/libs/mods/mod-my-feature/
# (Also accessible via: mods/libs/mod-my-feature/)

# Create a branch for it
git checkout -b mod/my-feature

# Start coding!
cd gui-js/libs/mods/mod-my-feature/src/lib/
```

### 3. Check the Example

See [`libs/mod-example/`](libs/mod-example/) for a complete working example showing:
- Service injection
- Component creation
- Backend integration
- Proper documentation

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [BUILD_SETUP.md](docs/BUILD_SETUP.md) | How to compile Minsky on Manjaro/Arch |
| [MODDING_GUIDE.md](docs/MODDING_GUIDE.md) | Complete guide to creating mods |
| [PLUGIN_SYSTEM_DESIGN.md](docs/PLUGIN_SYSTEM_DESIGN.md) | Runtime plugin system architecture |
| [GIT_WORKFLOW_QUICKREF.md](docs/GIT_WORKFLOW_QUICKREF.md) | Daily Git workflow commands |

---

## 🛠️ Tools

### `create-mod.sh`

Helper script to scaffold new mods:

```bash
./mods/tools/create-mod.sh <mod-name>

# Creates:
# - Directory structure
# - Service template
# - README and documentation
# - Proper file structure
```

**Usage:**
```bash
./mods/tools/create-mod.sh analytics
./mods/tools/create-mod.sh custom-export
./mods/tools/create-mod.sh better-plots
```

---

## 🎯 Philosophy

This directory exists to:

1. **Separate concerns** - Our modding infrastructure is isolated from the original messy repo
2. **Stay organized** - Everything related to modding is in one place
3. **Be discoverable** - New contributors know exactly where to look
4. **Remain portable** - Can be extracted to a separate repo if needed
5. **Keep clean** - Don't pollute the root directory

---

## 🌲 Branch Structure

```
master          → Clean upstream tracking (don't modify)
  └── dev       → Mod integration branch
       └── mod/feature-name → Individual mod branches
```

**All modding work happens on `dev` or `mod/*` branches.**

---

## 📦 Mod Types

### Service Mods
Add functionality via injectable services:
- Analytics tracking
- Data processing
- External integrations

### Component Mods
Add UI components:
- Custom widgets
- New visualizations
- Tool panels

### Feature Mods
Complete feature additions:
- Export formats
- Import handlers
- Reporting tools

---

## 🤝 Contributing

### Creating a Mod

1. Create mod: `./mods/tools/create-mod.sh my-feature`
2. Create branch: `git checkout -b mod/my-feature`
3. Develop in: `gui-js/libs/mods/mod-my-feature/`
4. Document in: `README.md` and `BASE_CHANGES.md`
5. Commit: `git commit -m "[mod-my-feature] Description"`
6. Merge to dev: `git checkout dev && git merge mod/my-feature`
7. Tag: `git tag mod-my-feature-v1.0.0`

### Best Practices

- ✅ Keep mods self-contained
- ✅ Document all changes to base code
- ✅ Use semantic versioning
- ✅ Write tests for your mods
- ✅ Follow the example mod patterns

---

## 🔗 Links

- **Original Repo**: https://github.com/highperformancecoder/minsky
- **Your Fork**: https://github.com/Qubeo/minsky-mod
- **Minsky Website**: http://minsky.sf.net
- **Manual**: http://minsky.sf.net/manual/minsky.html

---

## 📝 Version

**Infrastructure Version**: 1.0.0
**Last Updated**: 2026-01-04
**Minsky Version**: 3.20.0

---

**Happy Modding!** 🎉

For questions or issues, check the documentation in [`docs/`](docs/) or examine the [example mod](libs/mod-example/).
