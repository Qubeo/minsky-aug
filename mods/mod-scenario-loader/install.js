const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 1. Locate gui-js root (Robust sibling search)
let currentDir = process.cwd();
let guiJsRoot = null;

while (currentDir !== path.parse(currentDir).root) {
    const potentialGuiJs = path.join(currentDir, 'gui-js');
    if (fs.existsSync(path.join(potentialGuiJs, 'tsconfig.base.json'))) {
        guiJsRoot = potentialGuiJs;
        break;
    }
    currentDir = path.dirname(currentDir);
}

if (!guiJsRoot) {
    console.error("Error: Could not find gui-js directory. Ensure you are running this from within the Minsky repo.");
    process.exit(1);
}
console.log(`Repository root found at: ${guiJsRoot}`);

const MOD_NAME = 'mod-scenario-loader';
const MOD_SRC = __dirname;
const PATCHES_DIR = path.join(MOD_SRC, 'patches');
const LIBS_MODS_DIR = path.join(guiJsRoot, 'libs/mods');
const MOD_SYMLINK = path.join(LIBS_MODS_DIR, MOD_NAME);
const MANIFEST_PATH = path.join(MOD_SRC, 'manifest.json');

// 2. Load Manifest
if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("Error: manifest.json not found.");
    process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
console.log(`Loaded Manifest for ${manifest.id} v${manifest.version}`);

// 3. Verify Checksums
console.log("Verifying core file checksums...");
let checksumsMatch = true;

function calculateChecksum(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

for (const [relPath, expectedSum] of Object.entries(manifest.checksums)) {
    const filePath = path.join(guiJsRoot, relPath);
    const actualSum = calculateChecksum(filePath);

    if (!actualSum) {
        console.error(`MISSING: ${relPath}`);
        checksumsMatch = false;
    } else if (actualSum !== expectedSum) {
        // Check if it's already patched (compare with patch file?)
        // For now, strict check.
        console.warn(`CHECKSUM MISMATCH: ${relPath}`);
        console.warn(`  Expected: ${expectedSum}`);
        console.warn(`  Actual:   ${actualSum}`);
        checksumsMatch = false;
    } else {
        console.log(`OK: ${relPath}`);
    }
}

if (!checksumsMatch) {
    console.error("\n[ERROR] Core file checksums do not match manifest.");
    console.error("This means your Minsky version might be different or already modified.");
    console.error("Installation aborted to prevent corruption.");
    console.error("Run 'node uninstall.js' to restore backups if you previously installed.");
    process.exit(1);
}

// 4. Ensure libs/mods exists
if (!fs.existsSync(LIBS_MODS_DIR)) {
    fs.mkdirSync(LIBS_MODS_DIR, { recursive: true });
}

// 5. Symlink mod source
if (!fs.existsSync(MOD_SYMLINK)) {
    console.log("Creating symlink...");
    const relPath = path.relative(LIBS_MODS_DIR, MOD_SRC);
    try {
        fs.symlinkSync(relPath, MOD_SYMLINK, 'dir');
        console.log(`Symlink created.`);
    } catch (e) {
        console.error("Symlink failed", e);
    }
}

// 6. File Replacements
const fileMappings = [
    { src: 'tsconfig.base.json', dest: 'tsconfig.base.json' },
    { src: 'simulation.module.ts', dest: 'libs/menu/src/lib/simulation/simulation.module.ts' },
    { src: 'simulation-routing.module.ts', dest: 'libs/menu/src/lib/simulation/simulation-routing.module.ts' },
    { src: 'ApplicationMenuManager.ts', dest: 'apps/minsky-electron/src/app/managers/ApplicationMenuManager.ts' },
    // Removed constants.ts
    { src: 'electron.service.ts', dest: 'libs/core/src/lib/services/electron/electron.service.ts' },
    { src: 'electron.events.ts', dest: 'apps/minsky-electron/src/app/events/electron.events.ts' }
];

function backupAndCopy(mapping) {
    const srcPath = path.join(PATCHES_DIR, mapping.src);
    const destPath = path.join(guiJsRoot, mapping.dest);
    const backupPath = destPath + '.bak';

    if (!fs.existsSync(srcPath)) {
        console.error(`Patch file missing: ${srcPath}`);
        return;
    }

    if (fs.existsSync(destPath)) {
        if (!fs.existsSync(backupPath)) {
            console.log(`Backing up ${path.basename(destPath)}...`);
            fs.copyFileSync(destPath, backupPath);
        }
    }
    console.log(`Patching ${path.basename(destPath)}...`);
    fs.copyFileSync(srcPath, destPath);
}

console.log("\nApplying file patches...");
fileMappings.forEach(backupAndCopy);

console.log("\nInstallation complete! Please run 'npm start' or rebuild.");
