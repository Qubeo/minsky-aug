# Minsky Plugin System - Architecture Design

## Goal
Enable runtime loading of plugins without recompilation, with easy distribution to end users.

---

## Architecture Overview

```
User's Minsky Installation
├── minsky (executable)
├── resources/
│   └── plugins/              ← Plugin directory
│       ├── analytics/
│       │   ├── plugin.json   ← Plugin manifest
│       │   ├── bundle.js     ← Compiled plugin code
│       │   └── README.md
│       └── custom-export/
│           ├── plugin.json
│           └── bundle.js
└── userData/
    └── plugins.config.json   ← User's plugin settings
```

---

## Plugin Contract

### 1. Plugin Manifest (`plugin.json`)

Every plugin must have a manifest describing itself:

```json
{
  "id": "analytics",
  "name": "Analytics Dashboard",
  "version": "1.0.0",
  "description": "Adds simulation analytics and charts",
  "author": "Your Name",
  "homepage": "https://github.com/yourusername/minsky-plugin-analytics",
  "minskyVersion": ">=3.20.0",

  "main": "bundle.js",
  "icon": "icon.png",

  "permissions": [
    "backend:read",
    "backend:write",
    "filesystem:read",
    "network:fetch"
  ],

  "entryPoints": {
    "menuItems": true,
    "components": true,
    "services": true,
    "hooks": true
  },

  "dependencies": {
    "chart.js": "^4.0.0"
  }
}
```

### 2. Plugin Interface

All plugins must export a class implementing this interface:

```typescript
// /libs/shared/src/lib/plugin/plugin.interface.ts

export interface MinskyPlugin {
  /** Plugin metadata */
  readonly id: string;
  readonly name: string;
  readonly version: string;

  /** Lifecycle hooks */
  onLoad(context: PluginContext): Promise<void>;
  onActivate(): Promise<void>;
  onDeactivate(): Promise<void>;
  onUnload(): Promise<void>;

  /** Optional: Register UI components */
  registerComponents?(): PluginComponent[];

  /** Optional: Register menu items */
  registerMenuItems?(): PluginMenuItem[];

  /** Optional: Register services */
  registerServices?(): PluginService[];
}

export interface PluginContext {
  /** Access to Minsky services */
  services: {
    electron: ElectronService;
    communication: CommunicationService;
  };

  /** Plugin API */
  api: PluginAPI;

  /** Plugin data directory */
  dataDir: string;

  /** Plugin configuration */
  config: PluginConfig;
}

export interface PluginAPI {
  /** Register a new component */
  registerComponent(component: any): void;

  /** Register a menu item */
  registerMenuItem(item: PluginMenuItem): void;

  /** Subscribe to events */
  on(event: string, handler: Function): void;

  /** Emit events */
  emit(event: string, data?: any): void;

  /** Access backend */
  backend: {
    minsky: any;  // The C++ proxy
    call(method: string, ...args: any[]): Promise<any>;
  };

  /** Show notifications */
  notify(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;

  /** Storage API */
  storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
  };
}

export interface PluginMenuItem {
  id: string;
  label: string;
  icon?: string;
  parent?: string;  // Parent menu ID
  order?: number;
  onClick: () => void;
}

export interface PluginComponent {
  id: string;
  component: any;  // Angular component
  route?: string;
}

export interface PluginService {
  token: any;  // DI token
  service: any;  // Service class
}

export interface PluginConfig {
  [key: string]: any;
}
```

### 3. Example Plugin Implementation

```typescript
// In your plugin source code
import { MinskyPlugin, PluginContext } from '@minsky/shared';

export class AnalyticsPlugin implements MinskyPlugin {
  readonly id = 'analytics';
  readonly name = 'Analytics Dashboard';
  readonly version = '1.0.0';

  private context!: PluginContext;

  async onLoad(context: PluginContext): Promise<void> {
    this.context = context;
    console.log('Analytics plugin loaded!');

    // Initialize plugin resources
    await this.loadChartLibrary();
  }

  async onActivate(): Promise<void> {
    console.log('Analytics plugin activated!');

    // Register UI components
    this.context.api.registerComponent({
      id: 'analytics-dashboard',
      component: AnalyticsDashboardComponent,
      route: '/analytics'
    });

    // Add menu item
    this.context.api.registerMenuItem({
      id: 'analytics-menu',
      label: 'Analytics Dashboard',
      icon: 'chart-line',
      parent: 'tools',
      onClick: () => this.openDashboard()
    });

    // Listen to simulation events
    this.context.api.on('simulation:step', (data) => {
      this.recordStep(data);
    });
  }

  async onDeactivate(): Promise<void> {
    console.log('Analytics plugin deactivated');
    // Cleanup listeners, timers, etc.
  }

  async onUnload(): Promise<void> {
    console.log('Analytics plugin unloaded');
    // Final cleanup
  }

  private async loadChartLibrary() {
    // Dynamic import of dependencies
    const Chart = await import('chart.js');
    // ...
  }

  private openDashboard() {
    // Navigate to analytics route
    this.context.services.communication.sendEvent({
      event: 'NAVIGATE',
      payload: { route: '/analytics' }
    });
  }

  private recordStep(data: any) {
    // Store simulation step data
    this.context.api.storage.set(`step-${Date.now()}`, data);
  }
}

// Export for plugin loader
export default AnalyticsPlugin;
```

---

## Core Plugin System Implementation

### 1. Plugin Manager Service

```typescript
// /libs/core/src/lib/services/plugin-manager/plugin-manager.service.ts

import { Injectable } from '@angular/core';
import { ElectronService } from '../electron/electron.service';
import { MinskyPlugin, PluginContext, PluginAPI } from '@minsky/shared';
import * as fs from 'fs';
import * as path from 'path';

@Injectable({ providedIn: 'root' })
export class PluginManagerService {
  private plugins = new Map<string, LoadedPlugin>();
  private pluginsDir!: string;

  constructor(private electron: ElectronService) {
    this.initializePluginSystem();
  }

  private async initializePluginSystem() {
    // Get plugins directory (in user data)
    this.pluginsDir = await this.electron.ipcRenderer.invoke('GET_PLUGINS_DIR');

    // Ensure directory exists
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }

    // Auto-load enabled plugins
    await this.loadEnabledPlugins();
  }

  /** Scan plugins directory and discover plugins */
  async discoverPlugins(): Promise<PluginManifest[]> {
    const pluginDirs = fs.readdirSync(this.pluginsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const manifests: PluginManifest[] = [];

    for (const dir of pluginDirs) {
      const manifestPath = path.join(this.pluginsDir, dir, 'plugin.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        manifest.path = path.join(this.pluginsDir, dir);
        manifests.push(manifest);
      }
    }

    return manifests;
  }

  /** Load a plugin by ID */
  async loadPlugin(pluginId: string): Promise<void> {
    const manifests = await this.discoverPlugins();
    const manifest = manifests.find(m => m.id === pluginId);

    if (!manifest) {
      throw new Error(`Plugin not found: ${pluginId}`);
    }

    // Check if already loaded
    if (this.plugins.has(pluginId)) {
      console.warn(`Plugin already loaded: ${pluginId}`);
      return;
    }

    // Validate Minsky version compatibility
    if (!this.isCompatible(manifest.minskyVersion)) {
      throw new Error(`Plugin ${pluginId} requires Minsky ${manifest.minskyVersion}`);
    }

    // Load plugin code
    const bundlePath = path.join(manifest.path, manifest.main);

    try {
      // Dynamic import of the plugin bundle
      const pluginModule = await import(bundlePath);
      const PluginClass = pluginModule.default;

      // Instantiate plugin
      const plugin: MinskyPlugin = new PluginClass();

      // Create plugin context
      const context = this.createPluginContext(manifest);

      // Call plugin lifecycle: onLoad
      await plugin.onLoad(context);

      // Store loaded plugin
      this.plugins.set(pluginId, {
        manifest,
        instance: plugin,
        context,
        enabled: false,
      });

      console.log(`Plugin loaded: ${pluginId}`);

    } catch (error) {
      console.error(`Failed to load plugin ${pluginId}:`, error);
      throw error;
    }
  }

  /** Activate a loaded plugin */
  async activatePlugin(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) {
      throw new Error(`Plugin not loaded: ${pluginId}`);
    }

    if (loaded.enabled) {
      console.warn(`Plugin already active: ${pluginId}`);
      return;
    }

    await loaded.instance.onActivate();
    loaded.enabled = true;

    // Save to config
    await this.savePluginState(pluginId, true);

    console.log(`Plugin activated: ${pluginId}`);
  }

  /** Deactivate a plugin */
  async deactivatePlugin(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded || !loaded.enabled) return;

    await loaded.instance.onDeactivate();
    loaded.enabled = false;

    await this.savePluginState(pluginId, false);

    console.log(`Plugin deactivated: ${pluginId}`);
  }

  /** Unload a plugin */
  async unloadPlugin(pluginId: string): Promise<void> {
    const loaded = this.plugins.get(pluginId);
    if (!loaded) return;

    if (loaded.enabled) {
      await this.deactivatePlugin(pluginId);
    }

    await loaded.instance.onUnload();
    this.plugins.delete(pluginId);

    console.log(`Plugin unloaded: ${pluginId}`);
  }

  /** Get list of all plugins (loaded and discovered) */
  async getAllPlugins(): Promise<PluginInfo[]> {
    const discovered = await this.discoverPlugins();

    return discovered.map(manifest => ({
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      description: manifest.description,
      author: manifest.author,
      loaded: this.plugins.has(manifest.id),
      enabled: this.plugins.get(manifest.id)?.enabled || false,
      manifest,
    }));
  }

  /** Install plugin from file */
  async installPlugin(sourcePath: string): Promise<void> {
    // Extract plugin (if zip)
    // Validate plugin.json
    // Copy to plugins directory
    // Reload plugin list
  }

  /** Install plugin from URL */
  async installPluginFromURL(url: string): Promise<void> {
    // Download plugin
    // Extract and validate
    // Install
  }

  /** Uninstall plugin */
  async uninstallPlugin(pluginId: string): Promise<void> {
    await this.unloadPlugin(pluginId);

    const manifest = (await this.discoverPlugins()).find(m => m.id === pluginId);
    if (manifest) {
      fs.rmSync(manifest.path, { recursive: true, force: true });
    }
  }

  // --- Private helpers ---

  private createPluginContext(manifest: PluginManifest): PluginContext {
    const api = this.createPluginAPI(manifest.id);

    return {
      services: {
        electron: this.electron,
        communication: this.electron.communication,
      },
      api,
      dataDir: path.join(manifest.path, 'data'),
      config: this.loadPluginConfig(manifest.id),
    };
  }

  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      registerComponent: (comp) => {
        // Register with Angular router dynamically
        console.log(`Registering component for plugin ${pluginId}:`, comp);
      },

      registerMenuItem: (item) => {
        // Add to application menu
        console.log(`Registering menu item for plugin ${pluginId}:`, item);
      },

      on: (event, handler) => {
        // Subscribe to events
        this.electron.communication.on(event, handler);
      },

      emit: (event, data) => {
        // Emit events
        this.electron.communication.sendEvent({ event, payload: data });
      },

      backend: {
        minsky: this.electron.minsky,
        call: async (method, ...args) => {
          return await this.electron.minsky[method](...args);
        },
      },

      notify: (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Show toast notification
      },

      storage: {
        get: async (key) => {
          const dataPath = path.join(this.pluginsDir, pluginId, 'data', `${key}.json`);
          if (fs.existsSync(dataPath)) {
            return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
          }
          return null;
        },

        set: async (key, value) => {
          const dataDir = path.join(this.pluginsDir, pluginId, 'data');
          if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
          }
          const dataPath = path.join(dataDir, `${key}.json`);
          fs.writeFileSync(dataPath, JSON.stringify(value, null, 2));
        },

        delete: async (key) => {
          const dataPath = path.join(this.pluginsDir, pluginId, 'data', `${key}.json`);
          if (fs.existsSync(dataPath)) {
            fs.unlinkSync(dataPath);
          }
        },
      },
    };
  }

  private isCompatible(versionRange: string): boolean {
    // Implement semver compatibility check
    return true;  // Simplified
  }

  private async loadEnabledPlugins() {
    const config = this.loadPluginsConfig();
    const enabled = config.enabled || [];

    for (const pluginId of enabled) {
      try {
        await this.loadPlugin(pluginId);
        await this.activatePlugin(pluginId);
      } catch (error) {
        console.error(`Failed to auto-load plugin ${pluginId}:`, error);
      }
    }
  }

  private loadPluginsConfig(): any {
    const configPath = path.join(this.electron.userDataPath, 'plugins.config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    return { enabled: [] };
  }

  private loadPluginConfig(pluginId: string): any {
    const configPath = path.join(this.pluginsDir, pluginId, 'config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
    return {};
  }

  private async savePluginState(pluginId: string, enabled: boolean) {
    const config = this.loadPluginsConfig();
    config.enabled = config.enabled || [];

    if (enabled && !config.enabled.includes(pluginId)) {
      config.enabled.push(pluginId);
    } else if (!enabled) {
      config.enabled = config.enabled.filter((id: string) => id !== pluginId);
    }

    const configPath = path.join(this.electron.userDataPath, 'plugins.config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
}

interface LoadedPlugin {
  manifest: PluginManifest;
  instance: MinskyPlugin;
  context: PluginContext;
  enabled: boolean;
}

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  minskyVersion: string;
  main: string;
  icon?: string;
  permissions: string[];
  path: string;
}

interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  loaded: boolean;
  enabled: boolean;
  manifest: PluginManifest;
}
```

### 2. Plugin Manager UI Component

```typescript
// /libs/ui-components/src/lib/plugin-manager/plugin-manager.component.ts

import { Component, OnInit } from '@angular/core';
import { PluginManagerService } from '@minsky/core';

@Component({
  selector: 'minsky-plugin-manager',
  template: `
    <div class="plugin-manager">
      <h2>Plugin Manager</h2>

      <div class="actions">
        <button (click)="installFromFile()">Install from File</button>
        <button (click)="installFromURL()">Install from URL</button>
        <button (click)="refreshPlugins()">Refresh</button>
      </div>

      <div class="plugin-list">
        <div *ngFor="let plugin of plugins" class="plugin-card">
          <div class="plugin-header">
            <h3>{{ plugin.name }}</h3>
            <span class="version">v{{ plugin.version }}</span>
          </div>

          <p class="description">{{ plugin.description }}</p>
          <p class="author">By {{ plugin.author }}</p>

          <div class="plugin-actions">
            <button
              *ngIf="!plugin.loaded"
              (click)="loadPlugin(plugin.id)">
              Load
            </button>

            <button
              *ngIf="plugin.loaded && !plugin.enabled"
              (click)="activatePlugin(plugin.id)">
              Enable
            </button>

            <button
              *ngIf="plugin.loaded && plugin.enabled"
              (click)="deactivatePlugin(plugin.id)">
              Disable
            </button>

            <button
              *ngIf="plugin.loaded"
              (click)="unloadPlugin(plugin.id)">
              Unload
            </button>

            <button
              class="danger"
              (click)="uninstallPlugin(plugin.id)">
              Uninstall
            </button>
          </div>

          <div class="plugin-status">
            <span class="badge" [class.loaded]="plugin.loaded">
              {{ plugin.loaded ? 'Loaded' : 'Not Loaded' }}
            </span>
            <span class="badge" [class.enabled]="plugin.enabled">
              {{ plugin.enabled ? 'Enabled' : 'Disabled' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plugin-manager {
      padding: 20px;
    }

    .actions {
      margin-bottom: 20px;
    }

    .plugin-card {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }

    .plugin-actions button {
      margin-right: 10px;
    }

    .danger {
      color: red;
    }

    .badge {
      padding: 4px 8px;
      border-radius: 4px;
      margin-right: 8px;
    }

    .badge.loaded {
      background: #e3f2fd;
    }

    .badge.enabled {
      background: #c8e6c9;
    }
  `],
  standalone: true,
})
export class PluginManagerComponent implements OnInit {
  plugins: any[] = [];

  constructor(private pluginManager: PluginManagerService) {}

  async ngOnInit() {
    await this.refreshPlugins();
  }

  async refreshPlugins() {
    this.plugins = await this.pluginManager.getAllPlugins();
  }

  async loadPlugin(id: string) {
    await this.pluginManager.loadPlugin(id);
    await this.refreshPlugins();
  }

  async activatePlugin(id: string) {
    await this.pluginManager.activatePlugin(id);
    await this.refreshPlugins();
  }

  async deactivatePlugin(id: string) {
    await this.pluginManager.deactivatePlugin(id);
    await this.refreshPlugins();
  }

  async unloadPlugin(id: string) {
    await this.pluginManager.unloadPlugin(id);
    await this.refreshPlugins();
  }

  async uninstallPlugin(id: string) {
    if (confirm(`Are you sure you want to uninstall ${id}?`)) {
      await this.pluginManager.uninstallPlugin(id);
      await this.refreshPlugins();
    }
  }

  async installFromFile() {
    // Open file dialog
    const filePath = await this.electron.showOpenDialog({
      filters: [{ name: 'Plugin', extensions: ['zip', 'minsky-plugin'] }]
    });

    if (filePath) {
      await this.pluginManager.installPlugin(filePath);
      await this.refreshPlugins();
    }
  }

  async installFromURL() {
    const url = prompt('Enter plugin URL:');
    if (url) {
      await this.pluginManager.installPluginFromURL(url);
      await this.refreshPlugins();
    }
  }
}
```

---

## Plugin Development Workflow

### Step 1: Create Plugin Project

```bash
# In your mod directory
cd /libs/mods/mod-analytics

# Develop as normal Nx library
# Use all Minsky services and components
```

### Step 2: Create Plugin Wrapper

```typescript
// /libs/mods/mod-analytics/src/plugin.ts

import { MinskyPlugin, PluginContext } from '@minsky/shared';
import { AnalyticsService } from './lib/analytics.service';
import { AnalyticsDashboardComponent } from './lib/dashboard.component';

export default class AnalyticsPlugin implements MinskyPlugin {
  readonly id = 'analytics';
  readonly name = 'Analytics Dashboard';
  readonly version = '1.0.0';

  private service!: AnalyticsService;

  async onLoad(context: PluginContext): Promise<void> {
    // Initialize service
    this.service = new AnalyticsService(
      context.services.electron,
      context.api
    );
  }

  async onActivate(): Promise<void> {
    // Register component
    this.context.api.registerComponent({
      id: 'analytics-dashboard',
      component: AnalyticsDashboardComponent,
      route: '/analytics'
    });

    // Register menu
    this.context.api.registerMenuItem({
      id: 'analytics',
      label: 'Analytics',
      onClick: () => this.openDashboard()
    });
  }

  async onDeactivate(): Promise<void> {
    // Cleanup
  }

  async onUnload(): Promise<void> {
    // Final cleanup
  }
}
```

### Step 3: Build Plugin Bundle

```bash
# Create webpack config for standalone bundle
# /libs/mods/mod-analytics/webpack.config.js

module.exports = {
  entry: './src/plugin.ts',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist',
    library: {
      type: 'module',
    },
  },
  externals: {
    // Don't bundle Angular, use host's version
    '@angular/core': 'angular.core',
    '@angular/common': 'angular.common',
  },
  mode: 'production',
};

# Build
npm run build-plugin
```

### Step 4: Package for Distribution

```bash
# Create distribution folder
mkdir -p dist-plugin/analytics
cp dist/bundle.js dist-plugin/analytics/
cp plugin.json dist-plugin/analytics/
cp README.md dist-plugin/analytics/

# Create zip
cd dist-plugin
zip -r analytics-v1.0.0.zip analytics/

# Upload to GitHub releases or share directly
```

### Step 5: Installation by End User

**Option A: Manual**
```bash
# User extracts zip to:
# Linux: ~/.config/Minsky/plugins/
# Mac: ~/Library/Application Support/Minsky/plugins/
# Windows: %APPDATA%/Minsky/plugins/

unzip analytics-v1.0.0.zip -d ~/.config/Minsky/plugins/
```

**Option B: Via UI**
1. Open Minsky
2. Menu → Plugins → Install Plugin
3. Select `analytics-v1.0.0.zip`
4. Plugin auto-extracted and loaded
5. Enable plugin

---

## Distribution Strategies

### 1. GitHub Releases (Recommended)
```
https://github.com/YourUsername/minsky-plugin-analytics/releases/download/v1.0.0/analytics-v1.0.0.zip
```

Users install via URL in Minsky

### 2. Simple Plugin Repository (JSON)

Host a simple JSON file:

```json
{
  "plugins": [
    {
      "id": "analytics",
      "name": "Analytics Dashboard",
      "version": "1.0.0",
      "author": "Your Name",
      "description": "...",
      "downloadUrl": "https://your-site.com/plugins/analytics-v1.0.0.zip",
      "homepage": "https://github.com/..."
    }
  ]
}
```

Minsky can browse this catalog

### 3. NPM Scoped Packages (Advanced)

```bash
# Publish to npm
npm publish @minsky-augs/analytics

# Users install via Plugin Manager
# Minsky downloads from npm registry
```

---

## Security Considerations

1. **Code Signing** - Sign plugins with developer certificates
2. **Permissions** - Plugins declare required permissions
3. **Sandboxing** - Limit filesystem/network access
4. **Verification** - Hash checking on download
5. **User Consent** - Show permissions before activation

---

## Next Steps

1. **Implement PluginManagerService** in `/libs/core`
2. **Create PluginManagerComponent** UI
3. **Add "Plugins" menu item** to main menu
4. **Build example plugin** to test system
5. **Write plugin development guide**
6. **Set up plugin build scripts**

---

## Benefits of This Approach

✅ **No recompilation** - Users just install zip files
✅ **Hot reload** - Enable/disable without restart (with some limits)
✅ **Easy distribution** - Share via GitHub, URL, or file
✅ **Version control** - Plugins have versions, can update
✅ **Sandboxed** - Permissions system prevents abuse
✅ **Developer friendly** - Build with full TypeScript/Angular stack
✅ **User friendly** - Simple UI for install/manage

---

**Version:** 1.0.0
**Status:** Design Document
**Implementation Effort:** ~3-5 days for MVP
