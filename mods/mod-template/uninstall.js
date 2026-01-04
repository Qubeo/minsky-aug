const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const MOD_NAME = 'mod-template'; // Change this for new mods

// Core file mappings that were patched (for restoration)
// Must match install.js
const fileMappings = [
    { src: 'tsconfig.base.json', dest: 'tsconfig.base.json' },
];
// ---------------------

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
    console.error("Error: Could not find gui-js directory.");
    process.exit(1);
}

const LIBS_MODS_DIR = path.join(guiJsRoot, 'libs/mods');
const MOD_DEST_DIR = path.join(LIBS_MODS_DIR, MOD_NAME);

// 1. Remove Mod Directory
if (fs.existsSync(MOD_DEST_DIR)) {
    console.log(`Removing mod directory: ${MOD_DEST_DIR}`);
    fs.rmSync(MOD_DEST_DIR, { recursive: true, force: true });
} else {
    console.log("Mod directory not found.");
}

// 2. Restore Backups
function restoreBackup(mapping) {
    const destPath = path.join(guiJsRoot, mapping.dest);
    const backupPath = destPath + '.bak';

    if (fs.existsSync(backupPath)) {
        console.log(`Restoring ${path.basename(destPath)}...`);
        fs.copyFileSync(backupPath, destPath);
        fs.unlinkSync(backupPath); // Remove backup after restore
    }
}

if (fileMappings.length > 0) {
    console.log("\nRestoring core files...");
    fileMappings.forEach(restoreBackup);
}

console.log("\nUninstall complete. Please Clean & Rebuild.");
