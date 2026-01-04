# Mod Template
Use this template to scaffold new Minsky mods.

## How to Use
1.  **Copy** this folder to `mods/mod-your-name`.
2.  **Rename** `mod-template` to `mod-your-name` inside:
    -   `install.js`: Update `const MOD_NAME = 'mod-your-name';`
    -   `uninstall.js`: Update `const MOD_NAME = 'mod-your-name';`
    -   `manifest.json`: Update `id` field.
3.  **Implement** your mod logic in `src/`.
4.  **Patches**:
    -   Create a `patches/` folder.
    -   Add modified core files (e.g. `tsconfig.base.json`).
    -   Update `fileMappings` in `install.js` and `uninstall.js`.

## Structure
-   `src/`: Angular library source code.
-   `install.js` / `uninstall.js`: Installation scripts.
-   `manifest.json`: Metadata and checksums.
