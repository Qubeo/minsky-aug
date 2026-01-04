const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const args = process.argv.slice(2);
const useLink = args.includes('--link');
const filteredArgs = args.filter(arg => arg !== '--link');

if (filteredArgs.length === 0) {
    console.error('Usage: node tools/install-mod.js [--link] <mod-id or absolute-path>');
    process.exit(1);
}

const modIdentifier = filteredArgs[0];
let sourcePath;
let modId;

if (path.isAbsolute(modIdentifier)) {
    sourcePath = modIdentifier;
    modId = path.basename(modIdentifier);
} else {
    modId = modIdentifier;
    sourcePath = path.resolve(__dirname, '../mods', modId);
}

const TARGET_MODS = path.resolve(__dirname, '../../gui-js/libs/mods');
const targetPath = path.join(TARGET_MODS, modId);

if (!fs.existsSync(sourcePath)) {
    console.error(`Error: Mod source not found at ${sourcePath}`);
    process.exit(1);
}

// Ensure target directory exists
if (!fs.existsSync(TARGET_MODS)) {
    fs.mkdirSync(TARGET_MODS, { recursive: true });
}

// Check if already installed
if (fs.existsSync(targetPath)) {
    console.log(`Removing existing installation at ${targetPath}`);
    fs.rmSync(targetPath, { recursive: true, force: true });
}

try {
    if (useLink) {
        console.log(`Linking ${modId} from ${sourcePath} to ${targetPath}`);
        fs.symlinkSync(sourcePath, targetPath, 'dir');
        console.log(`Linked ${modId} successfully.`);
    } else {
        console.log(`Copying ${modId} from ${sourcePath} to ${targetPath}`);
        fs.cpSync(sourcePath, targetPath, { recursive: true });
        console.log(`Installed ${modId} successfully.`);
    }
} catch (e) {
    console.error(`Failed to install mod ${modId}:`, e);
    process.exit(1);
}

// Trigger config regeneration
console.log('Regenerating mod config...');
try {
    child_process.execSync('node generate-mod-config.js', {
        cwd: __dirname, // Run from tools folder
        stdio: 'inherit'
    });
} catch (e) {
    console.error('Failed to regenerate config.');
}
