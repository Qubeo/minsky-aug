# Content & Style Guide

## Documentation Standards

### Mandatory Files for Every Mod
*   **`README.md`**: What the mod does, how to use it, and how to configure it.
*   **`BASE_CHANGES.md`**: Meticulous log of ALL changes made to the Minsky core. Must include file paths, context, and exact code diffs.
*   **`install.js`**: Automated script to apply the changes documented in `BASE_CHANGES.md`.

### Markdown Style
*   Use **GitHub Flavored Markdown**.
*   **Headings**: Use sentence case (`## Installation steps`).
*   **Code**: Always specify language in code blocks (e.g., `typescript`, `bash`).
*   **Links**: Use relative links for local files (`./install.js`) and absolute links for external resources.

## Code Standards

*   **TypeScript**: Strict typing is required. Avoid `any`.
*   **Angular**: Follow the [Angular Style Guide](https://angular.io/guide/styleguide).
    *   One component per file.
    *   Suffix files correctly (`.component.ts`, `.service.ts`).
*   **Comments**: Explain *why*, not *what*.

## Git Commits

*   **Format**: `[mod-name] Short description of change`.
*   **Example**: `[scenario-loader] Fix CSV parsing bug for empty units`.
