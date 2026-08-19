---
description: "Analyze changes, generate commit message, and push to feature branch"
tools: ["read", "execute", "todo"]
---

# Commit and Push Changes

You are committing changes to a feature branch using conventional commit format.

## Input

- **branch-name** (REQUIRED): The feature branch name to commit and push to
  - Format: `feature/<descriptive-name>` or `fix/<descriptive-name>`
  - Examples: `feature/delete-endpoint`, `fix/todo-persistence`

**If no branch name is provided, ask the user for it before proceeding.**

## Workflow

### Step 1: Pre-Commit Validation

**If the current step includes required UI workflow:**
- Verify `npm run test:ui` has been run successfully in this session
- OR require successful `/run-ui-tests` execution before committing
- If UI tests haven't been run and are required, stop and prompt user to run `/run-ui-tests`

### Step 2: Analyze Changes

Review all changes made:
```bash
git status
git diff
```

Identify:
- Files modified
- Type of changes (features, fixes, tests, docs)
- Scope of changes (backend, frontend, both)

### Step 3: Generate Commit Message

Use conventional commit format (from `.github/copilot-instructions.md`):

**Format**: `<type>: <description>`

**Types**:
- `feat:` - New features
- `fix:` - Bug fixes
- `test:` - Test additions or modifications
- `refactor:` - Code restructuring without behavior change
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

**Example commit messages**:
```
feat: add DELETE endpoint for todos
fix: persist todos after page refresh
test: add UI tests for CRUD operations
refactor: extract validation logic to helper functions
```

### Step 4: Create or Switch to Branch

**If branch doesn't exist:**
```bash
git checkout -b <branch-name>
```

**If branch exists:**
```bash
git checkout <branch-name>
```

**IMPORTANT**: DO NOT commit to `main` or any other branch - ONLY use the user-provided branch name.

### Step 5: Stage All Changes

```bash
git add .
```

### Step 6: Commit with Generated Message

```bash
git commit -m "<generated-commit-message>"
```

### Step 7: Push to Branch

```bash
git push origin <branch-name>
```

If this is the first push to the branch:
```bash
git push -u origin <branch-name>
```

## Example Output

```markdown
✅ Changes Committed and Pushed

Branch: feature/delete-endpoint

Changes Analyzed:
- Modified: packages/backend/src/app.js (DELETE endpoint)
- Modified: packages/backend/__tests__/app.test.js (tests)
- Added: 1 new test for DELETE functionality

Commit Message:
feat: add DELETE endpoint for todos

Commit SHA: a1b2c3d
Branch: feature/delete-endpoint
Remote: pushed to origin/feature/delete-endpoint

Next steps:
- Continue with next exercise step, OR
- Create pull request: gh pr create --title "Add DELETE endpoint" --body "Implements DELETE /todos/:id"
```

## Safety Checks

Before committing:
- ✅ All tests passing (verify with user)
- ✅ UI tests passing (if required for this step)
- ✅ Branch name is valid (not `main`)
- ✅ Commit message follows conventional format
- ✅ All changes staged

## Branch Strategy

From `.github/copilot-instructions.md`:
- Feature branches: `feature/<descriptive-name>`
- Bug fixes: `fix/<descriptive-name>`
- Always stage all changes: `git add .`
- Push to correct branch: `git push origin <branch-name>`

## Reference

This prompt inherits Git workflow knowledge from:
- `.github/copilot-instructions.md` - Git Workflow section
- `.github/copilot-instructions.md` - Conventional Commits
