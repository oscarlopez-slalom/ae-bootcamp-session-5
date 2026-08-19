---
description: "Run UI tests and summarize failures"
agent: "test-engineer"
tools: ["read", "execute", "todo"]
---

# Run UI Tests

You are running Playwright UI tests and analyzing failures with root cause classification.

## Prerequisites

### REQUIRED: Install Playwright Dependencies

**Before running UI tests for the first time or after container rebuild:**
```bash
npm run test:ui:install --workspace=frontend
```

**Important - Ubuntu/Linux Environment:**
- `test:ui:install` is MANDATORY in Ubuntu/Linux environments
- Must run `playwright install --with-deps chromium` before tests
- Includes automatic bounded Ubuntu repo remediation for common Yarn GPG key issue
- One automatic retry if installation fails
- **DO NOT perform ad-hoc package hunting or broad OS troubleshooting beyond the automated remediation**
- **If install still fails after retry, STOP IMMEDIATELY and report environment blocker**
- **DO NOT continue to run Playwright tests after a failed dependency install**

### Backend and Frontend Must Be Running

Ensure services are running before executing UI tests:
```bash
# From repository root
npm start
```

This starts both:
- Backend: http://localhost:5001
- Frontend: http://localhost:3000

## Workflow

### Step 1: Install Dependencies (First Run / After Container Rebuild)

```bash
npm run test:ui:install --workspace=frontend
```

**If installation fails:**
- Report the failing command
- Include key error lines from output
- Mark as ENVIRONMENT BLOCKER
- DO NOT continue to Step 2

### Step 2: Verify Services Running

Check that backend and frontend are running:
```bash
# Check processes
ps aux | grep -E "(node|react)"

# Or verify ports
lsof -i :3000  # Frontend
lsof -i :5001  # Backend
```

**If services are not running:**
```bash
cd /workspaces/ae-bootcamp-session-5
npm start
```

### Step 3: Run UI Tests

**Headless mode (default):**
```bash
npm run test:ui --workspace=frontend
```

**With browser visible (debugging):**
```bash
npm run test:ui --workspace=frontend -- --headed
```

**Debug mode:**
```bash
npm run test:ui --workspace=frontend -- --debug
```

**Single file:**
```bash
npm run test:ui --workspace=frontend tests/ui/e2e.spec.js
```

**Specific browser:**
```bash
npm run test:ui --workspace=frontend -- --project=chromium
```

### Step 4: Summarize Results

**Clear summary format:**
```markdown
🧪 UI Test Results

Total: X tests
✅ Passed: Y tests (Z%)
❌ Failed: N tests

Duration: X.Xs
```

### Step 5: Classify Failures

For each failed test, classify into one of three categories:

#### 🐛 APPLICATION DEFECT
**Symptoms:**
- Business logic fails
- API returns incorrect data
- Feature doesn't work as expected
- Console errors in browser

**Example:**
```
Test: "should delete todo on button click"
Error: Todo still appears after delete
Root Cause: DELETE endpoint returns 200 but doesn't remove from array
Classification: 🐛 APPLICATION DEFECT
Action: Handoff to @tdd-developer to fix backend logic
```

#### 🧪 TEST DEFECT
**Symptoms:**
- Selector not found (but element exists)
- Test assertion incorrect
- Test logic error
- Test setup/teardown issues

**Example:**
```
Test: "should show success message"
Error: Element not found [data-testid="success"]
Root Cause: App uses "success-message", test uses wrong selector
Classification: 🧪 TEST DEFECT
Action: Fix test selector in e2e.spec.js
```

#### 🌍 ENVIRONMENT DEFECT
**Symptoms:**
- Backend service not running
- Port conflicts
- Network timeouts
- Dependency installation failures
- Timing differences in CI

**Example:**
```
Test: "should load todos from API"
Error: Network timeout after 30s
Root Cause: Backend server not running
Classification: 🌍 ENVIRONMENT DEFECT
Action: Start backend with `npm start` from root
```

### Step 6: Provide Actionable Diagnosis

For each failure:
1. **Show failure context** (test name, error message, key stack trace lines)
2. **Classify root cause** (application, test, or environment)
3. **Explain likely issue** (what's wrong and why)
4. **Suggest specific fix** (exact code changes or investigation steps)
5. **Note handoff** (which agent or person should address it)

## Example Output

```markdown
🧪 UI Test Results

Total: 8 tests
✅ Passed: 6 tests (75%)
❌ Failed: 2 tests

Duration: 18.5s

---

## Failed Tests

### ❌ Test 1: "should persist todos after page refresh"

**Error:**
```
Expected 1 todo, found 0 after page reload
```

**Classification:** 🐛 APPLICATION DEFECT

**Diagnosis:**
- Created todo before reload: ✓
- Todo appeared initially: ✓
- After page.reload(): Todo list empty
- Issue: Backend not persisting data between requests

**Root Cause:** 
Backend uses in-memory array that resets between requests. State is not shared at module level.

**Fix Required:**
- Handoff to @tdd-developer
- Fix state management in packages/backend/src/app.js
- Ensure todos array is defined at module level, not request level

**Related Pattern:**
See `.github/memory/patterns-discovered.md` - "Service Initialization: Empty Array vs Null"

---

### ❌ Test 2: "should show error on network failure"

**Error:**
```
waiting for selector "[data-testid="error"]" failed: timeout 30000ms exceeded
```

**Classification:** 🧪 TEST DEFECT

**Diagnosis:**
- Network failure simulation: ✓
- Error message appears in browser: ✓
- Element selector in test: `[data-testid="error"]`
- Actual app selector: `[data-testid="error-message"]`

**Root Cause:**
Test uses wrong selector. App changed selector but test wasn't updated.

**Fix Required:**
Update test selector:
```javascript
// Change:
await page.waitForSelector('[data-testid="error"]');

// To:
await page.waitForSelector('[data-testid="error-message"]');
```

---

## Summary

**Action Items:**

1. 🐛 Application defect: Fix state persistence in backend
   - Assign to: @tdd-developer
   - File: packages/backend/src/app.js
   - Priority: HIGH (data integrity issue)

2. 🧪 Test defect: Update error message selector
   - Can fix immediately
   - File: packages/frontend/tests/ui/e2e.spec.js
   - Priority: LOW (test maintenance)

**Next Steps:**
- Fix application defect first
- Update test selector
- Re-run: /run-ui-tests
- Once all passing: /validate-step {step-number}
```

## Scope Boundaries

**✅ This Prompt Handles:**
- Installing Playwright dependencies (with bounded remediation)
- Running UI tests
- Summarizing pass/fail results
- Classifying failures (app/test/environment)
- Providing actionable diagnosis

**❌ This Prompt Does NOT:**
- Fix application bugs (handoff to `@tdd-developer`)
- Create new UI tests (use `/create-ui-tests`)
- Perform extensive OS/package troubleshooting (environment blockers stop execution)

## Reference

This prompt inherits testing knowledge from:
- `.github/agents/test-engineer.agent.md` - Failure classification and test execution
- `.github/memory/patterns-discovered.md` - Test failure patterns
- `.github/copilot-instructions.md` - Testing approach
