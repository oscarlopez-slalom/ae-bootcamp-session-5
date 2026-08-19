---
description: "Execute instructions from the current GitHub Issue step"
agent: "tdd-developer"
tools: ["search", "read", "edit", "execute", "web", "todo"]
---

# Execute GitHub Issue Step

You are executing instructions from a GitHub Issue exercise step using Test-Driven Development principles.

## Input

- **issue-number** (optional): The GitHub issue number containing the exercise steps
  - If not provided, use `gh issue list --state open` to find the issue with "Exercise:" in the title
  - Use `gh issue view <issue-number> --comments` to get the full issue with step instructions

## Workflow

### Step 1: Retrieve Issue Content

If issue number not provided:
```bash
gh issue list --state open
```

Look for issue title containing "Exercise:" and extract the issue number.

Then get the full issue with comments:
```bash
gh issue view <issue-number> --comments
```

### Step 2: Parse Current Step Instructions

- Identify the latest step instructions from the issue comments
- Look for sections marked with `:keyboard: Activity:`
- Extract all activity tasks to execute

### Step 3: Execute Activities Systematically

For each `:keyboard: Activity:` section:
1. **Apply TDD Principles**:
   - Write tests FIRST (RED phase)
   - Implement minimal code to pass (GREEN phase)
   - Refactor while keeping tests green (REFACTOR phase)

2. **Follow Testing Scope**:
   - **Backend API changes**: Write Jest + Supertest tests FIRST
   - **Frontend components**: Write React Testing Library tests FIRST
   - **DO NOT create or run Playwright UI tests in this prompt**
   - **Handoff rule**: Use `/create-ui-tests` and `/run-ui-tests` for UI workflows

3. **Execute tasks incrementally**:
   - Complete one activity at a time
   - Verify with tests after each change
   - Track progress in `.github/memory/scratch/working-notes.md`

### Step 4: Scope Boundaries

**✅ This Prompt Handles:**
- Implementing backend API changes with Jest tests
- Implementing frontend components with React Testing Library tests
- Running unit and integration tests
- Making code changes based on step instructions

**❌ This Prompt Does NOT:**
- Create Playwright UI tests (use `/create-ui-tests`)
- Run Playwright UI tests (use `/run-ui-tests`)
- Commit or push changes (use `/commit-and-push`)
- Validate success criteria (use `/validate-step`)

### Step 5: Complete and Provide Next Commands

**DO NOT commit or push changes** - that's the job of `/commit-and-push`.

After completing all activities, provide the next commands in this exact order:

**If the current step requires UI workflow:**
```
Next steps:
1. /create-ui-tests
2. /run-ui-tests
3. /validate-step {step-number}
```

**If UI workflow is NOT required:**
```
Next step:
- /validate-step {step-number}
```

**IMPORTANT**: Never recommend `/validate-step` before completing required UI prompts.

## Testing Constraints

Follow the project's testing scope from `.github/copilot-instructions.md`:

- **Backend**: Jest + Supertest for API testing
- **Frontend**: React Testing Library for component behavior
- **UI Journeys**: Playwright (handled by `/create-ui-tests` and `/run-ui-tests` only)

## Memory Integration

During execution:
- Update `.github/memory/scratch/working-notes.md` with findings
- Track TDD cycle progress (RED-GREEN-REFACTOR)
- Document decisions and blockers

## Example Output

```markdown
✅ Executed Step 5-1: Implement DELETE endpoint

Activities Completed:
1. ✅ Wrote Jest test for DELETE /todos/:id (RED)
2. ✅ Implemented DELETE endpoint (GREEN)
3. ✅ Refactored error handling (REFACTOR)
4. ✅ All tests passing (15/15)

Testing Results:
- Backend tests: 15/15 passing
- Frontend tests: 23/23 passing

⚠️ This step requires UI workflow.

Next steps:
1. /create-ui-tests
2. /run-ui-tests
3. /validate-step 5-1

Do NOT run /validate-step until UI tests are complete.
```

## Reference

This prompt inherits gh CLI and Git knowledge from:
- `.github/copilot-instructions.md` - Workflow Utilities section
- `.github/copilot-instructions.md` - Git Workflow section
- `.github/agents/tdd-developer.agent.md` - TDD workflow guidance
