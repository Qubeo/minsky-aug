# Manifest Reference

## Schema

```json
{
  "id": "my-mod",
  "name": "My Mod",
  "version": "1.0.0",
  "contributes": {
    "menus": { ... },
    "commands": [ ... ],
    "routes": [ ... ],
    "ipc": [ ... ]
  }
}
```

## Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (lowercase, alphanumeric, hyphens) |
| `name` | No | Human-readable name |
| `version` | Yes | Semantic version (e.g., `1.0.0`) |
| `contributes` | No | What the mod adds to Minsky |

## Menus

### Top-Level Menus

Create new menus in the menu bar:

```json
"menus": {
  "topLevel": [
    { "id": "ai", "label": "AI", "after": "options" }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Menu identifier |
| `label` | Yes | Display label |
| `after` | No | Insert after this menu (e.g., `"options"`, `"simulation"`) |

### Menu Items

Add items to existing or new menus:

```json
"menus": {
  "items": [
    { "menu": "ai", "label": "AI Assist...", "command": "my-mod.open" },
    { "menu": "simulation", "label": "Export Data", "command": "my-mod.export" }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `menu` | Yes | Target menu id (e.g., `"ai"`, `"simulation"`, `"file"`) |
| `label` | Yes | Menu item label |
| `command` | Yes | Command ID to execute |

## Commands

Define what happens when a menu item is clicked:

```json
"commands": [
  {
    "id": "my-mod.open",
    "route": "my-mod",
    "window": { "width": 800, "height": 600, "title": "My Mod" }
  }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique command identifier |
| `route` | No | Angular route to navigate to |
| `window.width` | No | Popup window width |
| `window.height` | No | Popup window height |
| `window.title` | No | Window title |

## Routes

Register Angular routes for the mod UI:

```json
"routes": [
  { "path": "my-mod", "module": "MyModModule" }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `path` | Yes | URL path segment |
| `module` | Yes | Angular module name (must be exported from `src/index.ts`) |

## IPC Channels

Register backend IPC handlers:

```json
"ipc": [
  { "channel": "my-mod-action" }
]
```

| Field | Required | Description |
|-------|----------|-------------|
| `channel` | Yes | IPC channel name |

Handler implementation in `src/lib/ipc-handlers.ts`:
```typescript
export const ipcHandlers = {
  'my-mod-action': async (arg1: string) => {
    return `Processed: ${arg1}`;
  }
};
```

## Complete Example

```json
{
  "id": "llm-assist",
  "name": "LLM Assistant",
  "version": "1.0.0",
  "contributes": {
    "menus": {
      "topLevel": [
        { "id": "ai", "label": "AI", "after": "options" }
      ],
      "items": [
        { "menu": "ai", "label": "AI Assist...", "command": "llm-assist.open" }
      ]
    },
    "commands": [
      { "id": "llm-assist.open", "route": "llm-assist", "window": { "width": 800, "height": 600, "title": "AI Assistant" } }
    ],
    "routes": [
      { "path": "llm-assist", "module": "LlmAssistModule" }
    ],
    "ipc": [
      { "channel": "llm-generate" }
    ]
  }
}
```
