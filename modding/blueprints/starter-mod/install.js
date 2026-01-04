const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- CONFIGURATION ---
const MOD_NAME = 'mod-template'; // Change this for new mods
const PATCHES_DIR = path.join(__dirname, 'patches');

// Core file mappings to patch/replace
// Add entries here: { src: 'filename.ts', dest: 'libs/path/to/dest.ts' }
const fileMappings = [
    { src: 'tsconfig.base.json', dest: 'tsconfig.base.json' },
    // Example:
    // { src: 'simulation.module.ts', dest: 'libs/menu/src/lib/simulation/simulation.module.ts' },
];
// ---------------------

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

const MOD_SRC = __dirname;
const LIBS_MODS_DIR = path.join(guiJsRoot, 'libs/mods');
const MOD_DEST_DIR = path.join(LIBS_MODS_DIR, MOD_NAME);
const MANIFEST_PATH = path.join(MOD_SRC, 'manifest.json');

// 2. Load Manifest
if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("Error: manifest.json not found.");
    process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
console.log(`Loaded Manifest for ${manifest.id || MOD_NAME} v${manifest.version}`);

// Helper: Calculate Checksum
function calculateChecksum(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

// 3. Verify Checksums (Safety mechanism)
console.log("Verifying core file checksums...");
if (manifest.checksums) {
    for (const [relPath, expectedCleanSum] of Object.entries(manifest.checksums)) {
        const targetPath = path.join(guiJsRoot, relPath);
        const actualSum = calculateChecksum(targetPath);
        if (actualSum === expectedCleanSum) {
            console.log(`OK (Clean): ${relPath}`);
        } else {
            console.warn(`WARNING: Checksum mismatch for ${relPath}. Proceeding with caution.`);
        }
    }
}

// 4. Ensure libs/mods exists
if (!fs.existsSync(LIBS_MODS_DIR)) {
    fs.mkdirSync(LIBS_MODS_DIR, { recursive: true });
}

// 5. Copy Mod Source
console.log(`Copying mod source to ${MOD_DEST_DIR}...`);
// Simple copy strategy
function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    const excludes = ['.git', 'node_modules', 'patches', 'install.js', 'uninstall.js', 'manifest.json', 'libs', 'docs'];

    for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        if (excludes.includes(entry.name)) continue;

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
copyRecursive(MOD_SRC, MOD_DEST_DIR);
console.log("Mod source copied.");

// 6. Apply File Patches
function backupAndCopy(mapping) {
    const srcPath = path.join(PATCHES_DIR, mapping.src);
    const destPath = path.join(guiJsRoot, mapping.dest);
    const backupPath = destPath + '.bak';

    if (!fs.existsSync(srcPath)) {
        // Skip if patch file doesn't exist (e.g. commented out example)
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

if (fileMappings.length > 0) {
    console.log("\nApplying file patches...");
    fileMappings.forEach(backupAndCopy);
}

console.log("\nInstallation complete! Please run 'npm start' or rebuild.");
