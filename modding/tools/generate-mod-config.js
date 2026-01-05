const fs = require('fs');
const path = require('path');

const MODS_DIR = path.resolve(__dirname, '../../gui-js/libs/mods');
const OUTPUT_FRONTEND = path.resolve(__dirname, '../../gui-js/libs/shared/src/lib/modding/mod-config.frontend.generated.ts');
const OUTPUT_BACKEND = path.resolve(__dirname, '../../gui-js/libs/shared/src/lib/modding/mod-config.backend.generated.ts');

// Find all manifest.json files recursively
function findManifests(dir) {
    if (!fs.existsSync(dir)) return [];
    const results = [];
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory() && file !== 'node_modules') {
            results.push(...findManifests(full));
        } else if (file === 'manifest.json') {
            results.push(full);
        }
    }
    return results;
}

// Collected data
const mods = [];
const topLevelMenus = [];
const menuItems = [];
const commands = [];
const routes = [];
const ipcHandlers = [];

// Process each manifest
for (const manifestPath of findManifests(MODS_DIR)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (!manifest.id) continue;
    
    console.log(`Processing: ${manifest.id}`);
    mods.push(manifest.id);
    
    const c = manifest.contributes || {};
    
    // Menus
    for (const m of c.menus?.topLevel || []) {
        topLevelMenus.push({ ...m, modId: manifest.id });
    }
    for (const m of c.menus?.items || []) {
        menuItems.push({ ...m, modId: manifest.id });
    }
    
    // Commands
    for (const cmd of c.commands || []) {
        commands.push({ ...cmd, modId: manifest.id });
    }
    
    // Routes
    for (const r of c.routes || []) {
        routes.push({ path: r.path, module: r.module, modId: manifest.id });
    }
    
    // IPC
    for (const ipc of c.ipc || []) {
        ipcHandlers.push({ channel: ipc.channel, modId: manifest.id });
    }
}

// Generate frontend config
const frontend = `// AUTO-GENERATED - DO NOT EDIT
import { Routes } from '@angular/router';

export const activeMods = ${JSON.stringify(mods)};
export const topLevelMenus = ${JSON.stringify(topLevelMenus, null, 2)};
export const menuItems = ${JSON.stringify(menuItems, null, 2)};
export const commands = ${JSON.stringify(commands, null, 2)};

export const modRoutes: Routes = [
${routes.map(r => `  { path: '${r.path}', loadChildren: () => import('@minsky/${r.modId}').then(m => m.${r.module}) },`).join('\n')}
];
`;

// Generate backend config
const backend = `// AUTO-GENERATED - DO NOT EDIT
export const modIpcHandlers = [
${ipcHandlers.map(h => `  { channel: '${h.channel}', handler: async (e: any, ...args: any[]) => ((await import('../../../../mods/${h.modId}/src/lib/ipc-handlers')).ipcHandlers['${h.channel}'] as any)(...args) },`).join('\n')}
];
`;

fs.mkdirSync(path.dirname(OUTPUT_FRONTEND), { recursive: true });
fs.writeFileSync(OUTPUT_FRONTEND, frontend);
fs.writeFileSync(OUTPUT_BACKEND, backend);

console.log(`Generated configs. Mods: ${mods.length}, Menus: ${topLevelMenus.length}, Items: ${menuItems.length}`);
