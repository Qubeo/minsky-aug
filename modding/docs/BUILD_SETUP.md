# Minsky Build Setup - Manjaro/Arch Linux

## Issues Resolved

### 1. Missing Node.js Dependencies
**Problem:** `Can't find node header files`

**Solution:**
```bash
# Install npm dependencies (required for node-addon-api)
npm install
```

### 2. Node Headers Not Found (nvm users)
**Problem:** The Makefile searches for Node.js headers in standard system locations (`/usr/include/node`), but nvm installs them in `~/.nvm/versions/node/<version>/include/node`.

**Solution:**
```bash
# Create symlink for Makefile to find headers
mkdir -p ~/usr/include
ln -sf ~/.nvm/versions/node/v24.11.0/include/node ~/usr/include/node
```

**Note:** If you upgrade Node.js via nvm, you'll need to update this symlink:
```bash
# When upgrading to a new Node version
rm ~/usr/include/node
ln -sf ~/.nvm/versions/node/<NEW_VERSION>/include/node ~/usr/include/node
```

---

## Complete Build Instructions

### Prerequisites
```bash
# Install system dependencies
sudo pacman -S base-devel clang boost tcl tk cairo pango gsl librsvg openssl readline libxss nodejs npm

# Or if using nvm (recommended for Node.js version management)
# Make sure nvm and a recent Node.js version are installed
node -v  # Should be >= 20.11.1
```

### Building Minsky

1. **Clone and initialize repository:**
```bash
git clone https://github.com/Qubeo/minsky-aug.git
cd minsky-aug
git submodule update --init --recursive
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Create symlink for Node headers (nvm users only):**
```bash
mkdir -p ~/usr/include
ln -sf ~/.nvm/versions/node/$(node -v)/include/node ~/usr/include/node
```

4. **Build C++ backend:**
```bash
make -j4
```
This compiles the backend and creates `gui-js/node-addons/minskyRESTService.node`

5. **Build JavaScript frontend:**
```bash
cd gui-js
npm install
npm start  # Development mode
# OR
npm run export:package:linux  # Production build
```

### Running Minsky

**Development mode:**
```bash
cd gui-js
npm start
```

**Production build:**
```bash
gui-js/dist/executables/linux-unpacked/minsky
```

---

## Troubleshooting

### "Can't find node header files"
- Make sure `npm install` was run in the top-level directory
- Check if `node_modules/node-addon-api` exists
- For nvm users, verify the symlink exists: `ls -la ~/usr/include/node`

### "node: command not found"
- Install Node.js via nvm or pacman
- Make sure Node.js >= 20.11.1

### Compilation errors about missing libraries
- Check that all system dependencies are installed
- Run: `pacman -S base-devel clang boost tcl tk cairo pango gsl librsvg openssl readline libxss`

### Build is very slow
- Use parallel make: `make -j$(nproc)` to use all CPU cores
- First build takes longest (10-20 minutes)
- Subsequent builds are faster (only rebuilds changed files)

---

## Build Output Structure

```
minsky-aug/
├── ecolab/                      # EcoLab library (built first)
├── RavelCAPI/                   # Ravel C API (built second)
├── model/, engine/, schema/     # C++ source files
├── gui-js/                      # JavaScript/Electron frontend
│   ├── node-addons/
│   │   └── minskyRESTService.node  # ← C++ backend addon
│   └── dist/
│       └── executables/
│           └── linux-unpacked/
│               └── minsky       # ← Final executable
└── node_modules/                # Node.js dependencies
```

---

## Version Info

- **Minsky Version:** 3.20.0
- **Node.js Required:** >= 20.11.1
- **Angular:** 20.0.0
- **Electron:** 37.0.0
- **TypeScript:** 5.8.3
- **C++ Standard:** C++20
- **Compiler:** clang++ (preferred) or g++

---

**Last Updated:** 2026-01-04
**Platform:** Manjaro Linux / Arch-based systems
