const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = process.cwd(); // Run from Minsky repo root
const SOURCE_LIB = path.join(__dirname, 'src'); // Use the symlink in this dir
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

// Utils
function backup(filePath) {
    const bakPath = filePath + '.bak';
    if (fs.existsSync(filePath) && !fs.existsSync(bakPath)) {
        console.log(`Backing up ${path.basename(filePath)}...`);
        fs.copyFileSync(filePath, bakPath);
    }
}

function restore(filePath) {
    const bakPath = filePath + '.bak';
    if (fs.existsSync(bakPath)) {
        console.log(`Restoring ${path.basename(filePath)}...`);
        fs.copyFileSync(bakPath, filePath);
        // Optional: fs.unlinkSync(bakPath); // Keep backup or delete? Let's keep for safety
    }
}

function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf-8');
}

// Actions
function installLib() {
    console.log('Installing library files...');
    if (!fs.existsSync(TARGET_LIB)) {
        fs.mkdirSync(TARGET_LIB, { recursive: true });
        // Recursive copy implementation
        copyRecursive(SOURCE_LIB, TARGET_LIB);
    } else {
        console.log('Library directory already exists. Skipping copy.');
    }
}

function copyRecursive(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest);
        fs.readdirSync(src).forEach((childItemName) => {
            copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

function patchTsConfig() {
    const file = FILES.TSCONFIG;
    backup(file);
    const json = JSON.parse(readFile(file));

    if (!json.compilerOptions.paths['@minsky/mod-scenario-loader']) {
        console.log('Patching tsconfig.base.json...');
        json.compilerOptions.paths['@minsky/mod-scenario-loader'] = [
            "libs/mods/mod-scenario-loader/src/index.ts"
        ];
        writeFile(file, JSON.stringify(json, null, 2));
    }
}

function patchSimModule() {
    const file = FILES.SIM_MODULE;
    backup(file);
    let content = readFile(file);

    if (!content.includes('ScenarioLoaderComponent')) {
        console.log('Patching simulation.module.ts...');
        content = "import { ScenarioLoaderComponent } from '@minsky/mod-scenario-loader';\n" + content;
        // content = content.replace(/(imports:\s*\[)/, '$1 ScenarioLoaderComponent,'); // Simple regex
        // Safer: find imports array and append
        const regex = /(imports:\s*\[[^\]]*)/;
        content = content.replace(regex, "$1, ScenarioLoaderComponent");
        writeFile(file, content);
    }
}

function patchSimRouting() {
    const file = FILES.SIM_ROUTING;
    backup(file);
    let content = readFile(file);

    if (!content.includes('load-scenario')) {
        console.log('Patching simulation-routing.module.ts...');
        content = "import { ScenarioLoaderComponent } from '@minsky/mod-scenario-loader';\n" + content;
        const route = "  { path: 'load-scenario', component: ScenarioLoaderComponent },";
        const regex = /(const routes: Routes = \[\r?\n)/;
        content = content.replace(regex, `$1${route}\n`);
        writeFile(file, content);
    }
}

function patchAppMenu() {
    const file = FILES.APP_MENU;
    backup(file);
    let content = readFile(file);

    if (!content.includes('Load Scenario')) {
        console.log('Patching ApplicationMenuManager.ts...');
        // Hook before 'Dimensional Analysis'
        const anchor = "label: 'Dimensional Analysis'";
        const injection = `
        {
          label: 'Load Scenario...',
          click: async () => {
             WindowManager.createPopupWindowWithRouting({
              width: 800,
              height: 600,
              title: 'Load Scenario',
              url: \`#/headless/menu/simulation/load-scenario\`,
              modal: true,
            });
          }
        },`;

        // Find anchor
        if (content.includes(anchor)) {
            // Need regex to replace properly?
            // Just simple replace
            content = content.replace(anchor, `${injection}\n        ${anchor}`);
            writeFile(file, content);
        } else {
            console.error("Could not find anchor in ApplicationMenuManager");
        }
    }
}

function patchConstants() {
    const file = FILES.CONSTANTS;
    backup(file);
    let content = readFile(file);

    if (!content.includes('READ_FILE_TEXT')) {
        console.log('Patching constants.ts...');
        const regex = /(export const events = \{)/;
        content = content.replace(regex, "$1\n  READ_FILE_TEXT: 'read-file-text',");
        writeFile(file, content);
    }
}

function patchElectronEvents() {
    const file = FILES.ELECTRON_EVENTS;
    backup(file);
    let content = readFile(file);

    if (!content.includes('READ_FILE_TEXT')) {
        console.log('Patching electron.events.ts...');
        const snippet = `
ipcMain.handle(events.READ_FILE_TEXT, async (event, filePath: string) => {
  const fs = require('fs');
  return fs.readFileSync(filePath, 'utf-8');
});
`;
        // Append to end of file, inside a block? No, usually these are top level or inside init.
        // In Minsky, they seem to be inside AppEvents.processEvents or similar.
        // Let's look for "ipcMain.handle" and append after the last one? 
        // Or just find a known event like SAVE_FILE_DIALOG.
        const anchor = "ipcMain.handle(events.SAVE_FILE_DIALOG";
        if (content.includes(anchor)) {
            // We need to find the CLOSING brace of that handle block. Tricky with regex.
            // Better: Append at the end of the file if it's cleaner, but it needs to be inside scope if applicable.
            // Actually, looking at the file structure, they are often inside a method.
            // A safer bet: Find a specific handle call and insert BEFORE it.
            const beforeAnchor = "ipcMain.handle(events.OPEN_FILE_DIALOG";
            // content = content.replace(beforeAnchor, `${snippet}\n    ${beforeAnchor}`);
            // Let's assume we can just append for now, or use a specific known location.
            // Since I can't guarantee structure, manual might be safer? 
            // But for this script, let's try to be smart.
            // I will use `OPEN_FILE_DIALOG` as anchor and insert BEFORE it.
            content = content.replace(beforeAnchor, `${snippet}\n    ${beforeAnchor}`);
            writeFile(file, content);
        }
    }
}

function patchElectronService() {
    const file = FILES.ELECTRON_SERVICE;
    backup(file);
    let content = readFile(file);

    if (!content.includes('readFileText')) {
        console.log('Patching electron.service.ts...');
        const snippet = `
  async readFileText(filePath: string): Promise<string> {
    return await this.ipcRenderer.invoke(events.READ_FILE_TEXT, filePath);
  }
`;
        // Insert inside class ElectronService
        const anchor = "export class ElectronService {";
        content = content.replace(anchor, `${anchor}\n${snippet}`);
        writeFile(file, content);
    }
}

// Run
function main() {
    installLib();
    patchTsConfig();
    patchSimModule();
    patchSimRouting();
    patchAppMenu();
    patchConstants();
    patchElectronEvents();
    patchElectronService();
    console.log('Installation complete! Please run npm start or rebuild.');
}

main();
