#!/bin/bash
#
# create-mod.sh - Helper script to create a new Minsky mod
#
# Usage: ./create-mod.sh <mod-name>
# Example: ./create-mod.sh analytics

set -e

MOD_NAME=$1

if [ -z "$MOD_NAME" ]; then
  echo "Usage: ./create-mod.sh <mod-name>"
  echo "Example: ./create-mod.sh analytics"
  exit 1
fi

# Ensure mod name has 'mod-' prefix
if [[ ! $MOD_NAME == mod-* ]]; then
  MOD_NAME="mod-$MOD_NAME"
fi

MOD_DIR="gui-js/libs/mods/$MOD_NAME"
MOD_PATH="@minsky/$MOD_NAME"

echo "Creating new mod: $MOD_NAME"
echo "Directory: $MOD_DIR"
echo

# Check if mod already exists
if [ -d "$MOD_DIR" ]; then
  echo "Error: Mod directory already exists: $MOD_DIR"
  exit 1
fi

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$MOD_DIR/src/lib"

# Create index.ts
cat > "$MOD_DIR/src/index.ts" <<EOF
/**
 * @module $MOD_NAME
 * @description Minsky mod: ${MOD_NAME#mod-}
 */

export * from './lib/${MOD_NAME#mod-}.service';
// export * from './lib/${MOD_NAME#mod-}.component';
EOF

# Create service template
SERVICE_NAME="${MOD_NAME#mod-}"
cat > "$MOD_DIR/src/lib/${SERVICE_NAME}.service.ts" <<EOF
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ${SERVICE_NAME^}Service {
  constructor() {
    console.log('${SERVICE_NAME^}Service initialized');
  }

  // Add your service methods here
}
EOF

# Create README
cat > "$MOD_DIR/README.md" <<EOF
# ${MOD_NAME}

## Description

Brief description of what this mod does.

## Installation

### 1. Add to tsconfig.base.json

\`\`\`json
{
  "compilerOptions": {
    "paths": {
      "$MOD_PATH": ["libs/mods/$MOD_NAME/src/index.ts"]
    }
  }
}
\`\`\`

### 2. Use in Your App

\`\`\`typescript
import { ${SERVICE_NAME^}Service } from '$MOD_PATH';

constructor(private ${SERVICE_NAME}: ${SERVICE_NAME^}Service) {
  // Use the service
}
\`\`\`

## Base Code Changes

See \`BASE_CHANGES.md\`

## Version

1.0.0 - Initial version

## Author

Your Name
EOF

# Create BASE_CHANGES.md
cat > "$MOD_DIR/BASE_CHANGES.md" <<EOF
# Base Code Changes for $MOD_NAME

This mod requires the following changes to the base Minsky code.

## Files Modified

### \`/gui-js/tsconfig.base.json\`

**Add path mapping:**
\`\`\`json
"$MOD_PATH": ["libs/mods/$MOD_NAME/src/index.ts"]
\`\`\`

---

## Reverting Changes

To disable this mod:
1. Remove the path mapping from \`tsconfig.base.json\`
2. Remove any imports of \`$MOD_PATH\`

---

**Last Updated:** $(date +%Y-%m-%d)
**Mod Version:** 1.0.0
EOF

# Create CHANGELOG.md
cat > "$MOD_DIR/CHANGELOG.md" <<EOF
# Changelog - $MOD_NAME

## [1.0.0] - $(date +%Y-%m-%d)

### Added
- Initial version
- ${SERVICE_NAME^}Service

EOF

echo
echo "✅ Mod created successfully!"
echo
echo "Next steps:"
echo "1. Add to tsconfig.base.json:"
echo "   \"$MOD_PATH\": [\"libs/mods/$MOD_NAME/src/index.ts\"]"
echo
echo "2. Create a git branch:"
echo "   git checkout -b mod/${MOD_NAME#mod-}"
echo
echo "3. Start developing in:"
echo "   $MOD_DIR/src/lib/"
echo
echo "4. Import in your code:"
echo "   import { ${SERVICE_NAME^}Service } from '$MOD_PATH';"
echo

exit 0
