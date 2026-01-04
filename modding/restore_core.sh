#!/bin/bash

# restore_core.sh
# Restores the core Minsky files modified by mods to their clean state from origin/master.
# Use this if you want to reset your environment or if uninstallation fails.

# Ensure we are in the repo root or can find it
REPO_ROOT=$(git rev-parse --show-toplevel)
if [ -z "$REPO_ROOT" ]; then
  echo "Error: Not inside a git repository."
  exit 1
fi

cd "$REPO_ROOT"

echo "Restoring core files from origin/master..."

FILES_TO_RESTORE=(
  "gui-js/tsconfig.base.json"
  "gui-js/libs/menu/src/lib/simulation/simulation.module.ts"
  "gui-js/libs/menu/src/lib/simulation/simulation-routing.module.ts"
  "gui-js/apps/minsky-electron/src/app/managers/ApplicationMenuManager.ts"
  "gui-js/libs/core/src/lib/services/electron/electron.service.ts"
  "gui-js/apps/minsky-electron/src/app/events/electron.events.ts"
  "gui-js/libs/shared/src/lib/constants/constants.ts"
)

# Check if origin/master exists, otherwise fallback to master or HEAD
BRANCH="origin/master"
if ! git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
    echo "Warning: $BRANCH not found. Trying 'master'..."
    BRANCH="master"
fi
if ! git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
    echo "Warning: $BRANCH not found. Restoring from HEAD..."
    BRANCH="HEAD"
fi

git checkout "$BRANCH" -- "${FILES_TO_RESTORE[@]}"

# Clean up any potential backups created by install.js
find gui-js -name "*.bak" -type f -delete

echo "Core files restored from $BRANCH and .bak files removed."
