const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const TARGET_LIB = path.join(ROOT_DIR, 'gui-js/libs/mods/mod-scenario-loader');

const FILES = {
    TSCONFIG: path.join(ROOT_DIR, 'gui-js/tsconfig.base.json'),
    SIM_MODULE: path.join(ROOT_DIR, 'gui-js/libs/menu/src/lib/simulation/simulation.module.ts'),
    SIM_ROUTING: path.join(ROOT_DIR, 'gui-js/libs/menu/src/lib/simulation/simulation-routing.module.ts'),
    APP_MENU: path.join(ROOT_DIR, 'gui-js/apps/minsky-electron/src/app/managers/ApplicationMenuManager.ts'),
    CONSTANTS: path.join(ROOT_DIR, 'gui-js/libs/shared/src/lib/constants/constants.ts'),
    ELECTRON_EVENTS: path.join(ROOT_DIR, 'gui-js/apps/minsky-electron/src/app/events/electron.events.ts'),
    ELECTRON_SERVICE: path.join(ROOT_DIR, 'gui-js/libs/core/src/lib/services/electron/electron.service.ts'),
};

function restore(filePath) {
    const bakPath = filePath + '.bak';
    if (fs.existsSync(bakPath)) {
        console.log(`Restoring ${path.basename(filePath)} from backup...`);
        fs.copyFileSync(bakPath, filePath);
        fs.unlinkSync(bakPath); // Clean up backup
    } else {
        console.log(`No backup found for ${path.basename(filePath)}, skipping restore.`);
    }
}

function removeLib() {
    if (fs.existsSync(TARGET_LIB)) {
        console.log('Removing library directory...');
        fs.rmSync(TARGET_LIB, { recursive: true, force: true });
    }
}

function main() {
    console.log('Uninstalling Scenario Loader Mod...');

    // Restore files in reverse order of installation (good practice)
    const filesToRestore = Object.values(FILES);
    for (const file of filesToRestore) {
        restore(file);
    }

    // Remove code
    removeLib();

    console.log('Uninstallation complete! Please run npm start or rebuild.');
}

main();
