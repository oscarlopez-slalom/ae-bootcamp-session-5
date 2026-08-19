---
description: "Create UI tests for required critical user journeys"
agent: "test-engineer"
tools: ["search", "read", "edit", "execute", "todo"]
---

# Create UI Tests

You are creating Playwright UI tests for critical user journeys using Page Object Model best practices.

## Input

- **journeys** (optional): Specific user journeys to test
  - If not provided, use default set: create, edit, toggle, delete, and core error-state handling

## Test Creation Constraints

### HARD LIMIT: Maximum 5 Playwright Tests

- **Target**: 3-5 total test cases (`test(...)` or `it(...)` blocks)
- **Maximum**: 5 Playwright tests per run (strictly enforced)
- **Error path requirement**: At least 1 error-path test within the 3-5 total
- **If more than 5 scenarios exist**: Select the highest-risk 5 and list deferred scenarios
- **DO NOT exceed 5 tests** - this is a hard constraint

### Selection Priority (when more than 5 scenarios exist)

1. **Critical happy paths** (create, read, update, delete core flows)
2. **High-risk error scenarios** (data loss, security, payment failures)
3. **User-blocking issues** (login, checkout, submission failures)
4. **Cross-cutting concerns** (persistence, navigation, state management)
5. **Nice-to-have scenarios** (deferred if exceeding limit)

## Workflow

### Step 1: Identify Test Scenarios

**Default user journeys** (if not specified):
1. Create todo
2. Edit todo (if feature exists)
3. Toggle todo completion
4. Delete todo
5. Error state handling (network failure, validation errors)

**Select maximum 5 highest-priority scenarios.**

### Step 2: Apply Page Object Model (POM)

**Structure:**
```
packages/frontend/tests/
├── ui/
│   ├── pages/
│   │   ├── TodoPage.js          # Page Object
│   │   └── BasePage.js          # Shared behaviors
│   ├── helpers/
│   │   └── testData.js          # Test data factory
│   └── e2e.spec.js              # Test scenarios
```

**Page Object Pattern:**
- Centralize selectors in page objects
- Reusable methods for UI interactions
- Keep tests focused on scenario intent
- Use state-based waits (no arbitrary timeouts)

### Step 3: Implement Tests with Best Practices

**Selector Priority:**
1. ✅ `[data-testid="element-name"]` - Most stable
2. ✅ `page.getByRole('button', { name: 'Add' })` - Accessibility-first
3. ✅ `page.getByLabel('New todo')` - Semantic
4. ⚠️ `page.getByText('Delete')` - Language-dependent
5. ❌ Avoid CSS classes (brittle)

**State-Based Waits:**
```javascript
// ✅ GOOD - Wait for specific state
await page.waitForSelector('[data-testid="todo-1"]');
await page.waitForResponse(res => res.url().includes('/api/todos'));

// ❌ BAD - Arbitrary timeout
await page.waitForTimeout(2000);
```

**Page Object Example:**
```javascript
// pages/TodoPage.js
export class TodoPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      input: '[data-testid="todo-input"]',
      addButton: '[data-testid="add-button"]',
      todoItem: (id) => `[data-testid="todo-${id}"]`
    };
  }

  async addTodo(text) {
    await this.page.fill(this.selectors.input, text);
    await this.page.click(this.selectors.addButton);
    await this.page.waitForSelector(this.selectors.todoItem(1));
  }
}

// e2e.spec.js - Test focused on intent
test('should create and delete a todo', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.addTodo('Buy milk');
  expect(await todoPage.getTodoText(1)).toContain('Buy milk');
  await todoPage.deleteTodo(1);
});
```

### Step 4: Ensure Test Quality

**Test characteristics:**
- **Deterministic**: Same result every run
- **Isolated**: No shared state between tests
- **Readable**: Clear scenario intent
- **Maintainable**: POM pattern, centralized selectors

**Isolation example:**
```javascript
test.beforeEach(async ({ page }) => {
  // Each test gets fresh state
  await page.goto('http://localhost:3000');
});
```

### Step 5: Verify Test Count and Report

**Before finishing:**
1. Count all `test(...)` or `it(...)` blocks created
2. Verify count is <= 5
3. If > 5, reduce to highest-priority 5 scenarios
4. List any deferred scenarios separately

**Report format:**
```markdown
✅ UI Tests Created

Tests Implemented (X/5 max):
1. ✅ Create todo
2. ✅ Toggle todo completion
3. ✅ Delete todo
4. ✅ Persist todos after refresh
5. ✅ Handle network errors

Error-path coverage: 1/5 tests (network error scenario)

Files Changed:
- packages/frontend/tests/ui/pages/TodoPage.js (created)
- packages/frontend/tests/ui/e2e.spec.js (5 tests added)

Deferred Scenarios (not implemented - would exceed 5-test limit):
- Edit todo text
- Filter todos by status
- Bulk delete operations

Page Object Methods:
- addTodo(text)
- toggleTodo(id)
- deleteTodo(id)
- getTodoText(id)
- reload()

Next step: /run-ui-tests
```

## Scope Boundaries

**✅ This Prompt Handles:**
- Creating Playwright UI tests (max 5)
- Implementing Page Object Model
- Using stable selectors and state-based waits
- Ensuring test isolation and determinism

**❌ This Prompt Does NOT:**
- Run tests (use `/run-ui-tests`)
- Fix application bugs (handoff to `@tdd-developer`)
- Create more than 5 tests per run
- Create unit or integration tests (those are in TDD workflow)

## Example Output (Maximum 5 Tests)

```markdown
✅ UI Tests Created - Within Limit

Tests Implemented (5/5 max):
1. ✅ Create todo
2. ✅ Toggle todo completion  
3. ✅ Delete todo
4. ✅ Persist after refresh (critical data integrity)
5. ✅ Show error on network failure (error path)

Error-path coverage: 1/5 tests

Files Changed:
- packages/frontend/tests/ui/pages/TodoPage.js (page object created)
- packages/frontend/tests/ui/e2e.spec.js (5 test scenarios)

✅ Test count verified: 5 tests (within 5-test limit)

Deferred Scenarios (high priority for next iteration):
- Edit todo text (nice-to-have, not blocking)
- Multiple todos independently (covered by unit tests)

Page Object Structure:
- Centralized selectors in TodoPage
- Reusable interaction methods
- State-based waits throughout
- No arbitrary timeouts

Next step: /run-ui-tests
```

## Reference

This prompt inherits testing knowledge from:
- `.github/agents/test-engineer.agent.md` - POM patterns and test quality
- `.github/memory/patterns-discovered.md` - Playwright best practices
- `.github/copilot-instructions.md` - Testing approach
