---
description: "Validate that all success criteria for the current step are met"
agent: "code-reviewer"
tools: ["search", "read", "execute", "web", "todo"]
---

# Validate Exercise Step

You are validating that all success criteria for a GitHub Issue exercise step have been met.

## Input

- **step-number** (REQUIRED): The step number to validate (e.g., "5-0", "5-1", "5-2")
  - Format: `{exercise-number}-{step-number}`
  - Example: `5-0`, `5-1`, `5-2`

**The step number is required. If not provided, ask the user for it.**

## Workflow

### Step 1: Retrieve Issue Content

Use gh CLI to find the main exercise issue:
```bash
gh issue list --state open
```

Look for issue title containing "Exercise:" and extract the issue number.

Get the full issue with comments:
```bash
gh issue view <issue-number> --comments
```

### Step 2: Locate Step and Success Criteria

Search through the issue content for:
```
# Step {step-number}:
```

Extract the **Success Criteria** section from that step:
```
## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

### Step 3: Validate Each Criterion

For each success criterion, check the current workspace state:

**Code verification:**
- Check if files exist and contain expected code
- Verify API endpoints are implemented
- Confirm UI components are present

**Test verification:**
- Run backend tests: `npm test --workspace=backend`
- Run frontend tests: `npm test --workspace=frontend`
- Check UI tests if applicable: `npm run test:ui --workspace=frontend`

**Functional verification:**
- Verify services are running (if applicable)
- Check API responses (if applicable)
- Validate UI behavior (if applicable)

### Step 4: Report Validation Results

**Format:**
```markdown
# Step {step-number} Validation

## Success Criteria Status

✅ Criterion 1: [Description]
   - Verified: [How it was checked]
   
✅ Criterion 2: [Description]
   - Verified: [How it was checked]

❌ Criterion 3: [Description]
   - Issue: [What's missing or incorrect]
   - Required action: [Specific guidance]

## Overall Status

Status: [COMPLETE ✅ | INCOMPLETE ⚠️]

Passing: X/Y criteria

## Next Steps

[If complete]:
- Ready to proceed to next step
- Consider running /commit-and-push <branch-name>

[If incomplete]:
- Address the following issues:
  1. [Specific action needed]
  2. [Specific action needed]
- Re-run /validate-step {step-number} after fixes
```

## Validation Checklist

### Code Quality
- [ ] All required files exist
- [ ] Code follows project patterns
- [ ] No obvious errors or issues

### Test Coverage
- [ ] Backend tests passing
- [ ] Frontend tests passing
- [ ] UI tests passing (if required)

### Functionality
- [ ] Features work as expected
- [ ] Error handling implemented
- [ ] Edge cases covered

### Documentation
- [ ] Code is documented
- [ ] Memory system updated (if applicable)

## Example Output

```markdown
# Step 5-1 Validation

## Success Criteria Status

✅ DELETE endpoint implemented
   - Verified: Found DELETE route in packages/backend/src/app.js
   - Test: DELETE /todos/:id endpoint exists and handles requests

✅ Endpoint returns appropriate status codes
   - Verified: Returns 200 on success, 404 on not found
   - Test: All status code tests passing

✅ All tests passing
   - Backend: 15/15 tests passing ✓
   - Frontend: 23/23 tests passing ✓
   - UI: 8/8 tests passing ✓

❌ Error handling for invalid ID
   - Issue: No validation for non-numeric IDs
   - Required action: Add validation to return 400 for invalid ID format
   - Suggested fix: Add parseInt validation in route handler

## Overall Status

Status: INCOMPLETE ⚠️

Passing: 3/4 criteria

## Next Steps

Address the following issue:
1. Add ID validation in DELETE endpoint:
   - Check if ID is numeric
   - Return 400 with error message for invalid IDs
   - Add test case for invalid ID scenario

After fixing:
- Re-run /validate-step 5-1
- Once all criteria pass, run /commit-and-push feature/delete-endpoint
```

## Reference

This prompt inherits validation knowledge from:
- `.github/copilot-instructions.md` - Workflow Utilities section
- `.github/agents/code-reviewer.agent.md` - Code quality standards
- `.github/memory/patterns-discovered.md` - Established patterns
