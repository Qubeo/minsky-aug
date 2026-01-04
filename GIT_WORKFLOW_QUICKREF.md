# Git Workflow Quick Reference

## Repository Setup ✅

Your repository is now configured for modding with the following structure:

### Remotes
```bash
origin    → https://github.com/Qubeo/minsky-mod.git (your fork)
upstream  → https://github.com/highperformancecoder/minsky.git (original)
```

### Branches
```
master  → Clean tracking of upstream (never modify)
dev     → Your integration branch (where mods come together)
mod/*   → Individual mod development branches
```

### Current Status
```bash
$ git branch
  master
* dev       ← You are here

$ git log --oneline -1
206a769 [setup] Initialize modding infrastructure
```

---

## Daily Workflow

### Creating a New Mod

```bash
# 1. Start from dev branch
git checkout dev

# 2. Create mod using helper script
./create-mod.sh my-feature
# This creates: gui-js/libs/mods/mod-my-feature/

# 3. Create mod branch
git checkout -b mod/my-feature

# 4. Add to tsconfig.base.json (see script output)
# Edit gui-js/tsconfig.base.json and add:
# "@minsky/mod-my-feature": ["libs/mods/mod-my-feature/src/index.ts"]

# 5. Develop your mod
cd gui-js/libs/mods/mod-my-feature/src/lib/
# Edit files...

# 6. Commit your work
git add .
git commit -m "[mod-my-feature] Add initial implementation"

# 7. Merge to dev when ready
git checkout dev
git merge mod/my-feature

# 8. Tag the version
git tag mod-my-feature-v1.0.0
```

### Working on Existing Mod

```bash
# Switch to mod branch
git checkout mod/my-feature

# Make changes
# ...

# Commit
git add .
git commit -m "[mod-my-feature] Update to handle X"

# Merge to dev
git checkout dev
git merge mod/my-feature
```

### Syncing with Upstream (Monthly)

```bash
# 1. Update master from upstream
git checkout master
git pull upstream master

# 2. Rebase dev on updated master
git checkout dev
git rebase master

# 3. Update your mod branches
git checkout mod/my-feature
git rebase dev

# 4. Push to your fork
git push origin dev --force-with-lease
git push origin mod/my-feature --force-with-lease
```

---

## Common Commands

### Status Check
```bash
# See what branch you're on
git branch

# See uncommitted changes
git status

# See commit history
git log --oneline --graph --all -10
```

### Branch Management
```bash
# List all branches (including remotes)
git branch -a

# Delete a mod branch (after merging)
git branch -d mod/old-feature

# Rename current branch
git branch -m new-name
```

### Remote Management
```bash
# View remotes
git remote -v

# Fetch from all remotes
git fetch --all

# View upstream branches
git branch -r | grep upstream
```

---

## Mod Development Flow

```
1. Create mod branch          git checkout -b mod/feature
                              ./create-mod.sh feature

2. Develop                    Edit files in gui-js/libs/mods/mod-feature/

3. Test locally               Build and run Minsky

4. Commit frequently          git add . && git commit -m "..."

5. Merge to dev               git checkout dev
                              git merge mod/feature

6. Tag version                git tag mod-feature-v1.0.0

7. Push to fork (optional)    git push origin dev
                              git push origin mod/feature
```

---

## Files Created

### Documentation
- `BUILD_SETUP.md` - Build instructions for Manjaro
- `MODDING_GUIDE.md` - Complete modding workflow guide
- `PLUGIN_SYSTEM_DESIGN.md` - Runtime plugin system architecture
- `GIT_WORKFLOW_QUICKREF.md` - This file

### Infrastructure
- `gui-js/libs/mods/` - Mods directory
- `gui-js/libs/mods/mod-example/` - Example mod
- `create-mod.sh` - Mod scaffolding script
- `.gitignore` - Updated with mod artifacts

---

## Next Steps

1. **Wait for build to complete** (`make -j4` in your terminal)
2. **Build the frontend:**
   ```bash
   cd gui-js
   npm install
   npm start
   ```
3. **Create your first real mod:**
   ```bash
   ./create-mod.sh analytics
   git checkout -b mod/analytics
   # Start coding!
   ```

---

## Troubleshooting

### Merge Conflicts
```bash
# If you get conflicts during merge
git status  # See conflicted files
# Edit files to resolve <<<<< markers
git add .
git commit
```

### Undo Last Commit (before push)
```bash
git reset --soft HEAD~1  # Keep changes
# or
git reset --hard HEAD~1  # Discard changes
```

### See What Changed
```bash
# Between branches
git diff master..dev

# In a specific mod
git diff HEAD~5..HEAD -- gui-js/libs/mods/mod-feature/
```

---

**Repository:** https://github.com/Qubeo/minsky-mod
**Upstream:** https://github.com/highperformancecoder/minsky
**Current Branch:** dev
**Last Updated:** 2026-01-04
