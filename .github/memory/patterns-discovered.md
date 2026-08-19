# Code Patterns Discovered

This file documents recurring patterns, solutions, and conventions discovered during development. Use these patterns to maintain consistency across the codebase.

---

## Pattern Template

Use this template when adding new patterns:

```markdown
### Pattern Name

**Context**: When and where this pattern applies

**Problem**: What problem does this pattern solve?

**Solution**: How to implement this pattern

**Example**:
```javascript
// Code example demonstrating the pattern
```

**Related Files**: 
- `path/to/file.js` - Lines X-Y
- `path/to/another-file.js` - Lines A-B

**Notes**: Additional considerations or variations
```

---

## Established Patterns

### Service Initialization: Empty Array vs Null

**Context**: Initializing in-memory data stores in Express services

**Problem**: Services need consistent initialization patterns to avoid runtime errors. Using `null` or `undefined` causes "Cannot read property" errors when trying to iterate or manipulate data collections.

**Solution**: Initialize collections as empty arrays at module level, not request level. This ensures:
- Predictable behavior across requests
- No null checks needed in array operations
- Consistent state management

**Example**:
```javascript
// ✅ GOOD - Initialize at module level
let todos = [];

app.get('/todos', (req, res) => {
  res.json(todos); // Always works, returns [] or data
});

// ❌ BAD - Null initialization
let todos = null;

app.get('/todos', (req, res) => {
  res.json(todos.filter(t => !t.completed)); // TypeError: Cannot read property 'filter' of null
});
```

**Related Files**: 
- `packages/backend/src/app.js` - Todo service initialization

**Notes**: 
- For database-backed services, this pattern still applies to temporary collections
- Consider using a proper state management library for complex applications
- In-memory storage is suitable for development but not production

---

### Test-First Implementation (TDD Core Pattern)

**Context**: All new feature development

**Problem**: Implementing code before tests leads to:
- Untested edge cases
- Difficult-to-test code structure
- Missing test coverage
- Unclear requirements

**Solution**: Always write tests BEFORE implementation code (RED-GREEN-REFACTOR):
1. **RED**: Write failing test that describes desired behavior
2. **GREEN**: Implement minimal code to make test pass
3. **REFACTOR**: Improve code while keeping tests green

**Example**:
```javascript
// STEP 1 (RED): Write failing test first
describe('DELETE /todos/:id', () => {
  it('should delete a todo and return success message', async () => {
    // Arrange
    const mockTodo = { id: 1, title: 'Test', completed: false };
    todos.push(mockTodo);
    
    // Act
    const response = await request(app)
      .delete('/todos/1')
      .expect(200);
    
    // Assert
    expect(response.body).toHaveProperty('message');
    expect(todos.length).toBe(0);
  });
});

// STEP 2 (GREEN): Implement minimal code
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  todos = todos.filter(t => t.id !== id);
  res.json({ message: 'Todo deleted' });
});

// STEP 3 (REFACTOR): Extract validation, improve structure
function validateTodoId(id) {
  const parsed = parseInt(id);
  if (isNaN(parsed)) throw new Error('Invalid ID');
  return parsed;
}

app.delete('/todos/:id', (req, res) => {
  const id = validateTodoId(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter(t => t.id !== id);
  
  if (todos.length === initialLength) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  
  res.json({ message: 'Todo deleted' });
});
```

**Related Files**: 
- `packages/backend/__tests__/app.test.js` - Backend TDD examples
- `packages/frontend/src/__tests__/App.test.js` - Frontend TDD examples
- `.github/agents/tdd-developer.agent.md` - TDD workflow agent

**Notes**: 
- This is the foundational principle of Test-Driven Development
- Tests document intended behavior
- Minimal implementation prevents over-engineering
- Refactoring is safe when tests are green

---

### API Error Response Consistency

**Context**: All API endpoint error handling

**Problem**: Inconsistent error response formats make client-side error handling difficult and unpredictable.

**Solution**: Use consistent error response structure across all endpoints:
- Status code appropriate to error type (400, 404, 500, etc.)
- JSON response with `error` property containing message
- Optional `details` property for additional context

**Example**:
```javascript
// Validation error (400)
res.status(400).json({ 
  error: 'Invalid todo ID',
  details: { id: req.params.id }
});

// Not found error (404)
res.status(404).json({ 
  error: 'Todo not found' 
});

// Server error (500)
res.status(500).json({ 
  error: 'Internal server error',
  details: process.env.NODE_ENV === 'development' ? err.message : undefined
});

// Success response (200)
res.json({ 
  message: 'Todo deleted',
  id: deletedId 
});
```

**Related Files**: 
- `packages/backend/src/app.js` - Error handling patterns

**Notes**: 
- Success responses use `message` property
- Error responses use `error` property
- Never expose sensitive error details in production
- Consider middleware for centralized error handling

---

### React Testing Library: Accessibility-First Selectors

**Context**: Writing frontend component tests

**Problem**: CSS and class-based selectors are brittle and break when styling changes. They don't reflect how users interact with the application.

**Solution**: Use accessibility-first query methods that match how users and assistive technologies interact with the UI:

**Query Priority**:
1. ✅ `getByRole` - Semantic HTML roles (button, heading, textbox)
2. ✅ `getByLabelText` - Form labels
3. ✅ `getByPlaceholderText` - Input placeholders
4. ✅ `getByText` - Visible text content
5. ⚠️ `getByTestId` - Last resort with `data-testid`

**Example**:
```javascript
// ✅ GOOD - Accessibility-first
const checkbox = screen.getByRole('checkbox', { name: /buy milk/i });
const deleteButton = screen.getByRole('button', { name: /delete/i });
const input = screen.getByLabelText(/new todo/i);

fireEvent.click(checkbox);
fireEvent.click(deleteButton);

// ❌ BAD - Brittle CSS selectors
const checkbox = container.querySelector('.todo-checkbox');
const deleteButton = container.querySelector('.btn-danger');
```

**Related Files**: 
- `packages/frontend/src/__tests__/App.test.js` - RTL test examples

**Notes**: 
- These selectors improve accessibility as a side effect
- Tests document the user experience
- Use `screen.debug()` to see available roles
- Add `data-testid` only when semantic queries aren't possible

---

### Playwright: State-Based Waits

**Context**: End-to-end UI tests with Playwright

**Problem**: Fixed timeouts (`waitForTimeout`) are unreliable and make tests slow or flaky. They don't reflect actual application state.

**Solution**: Wait for specific state changes, not arbitrary time periods:

**Example**:
```javascript
// ✅ GOOD - Wait for specific state
await page.click('[data-testid="add-todo-button"]');
await page.waitForSelector('[data-testid="todo-1"]'); // Wait for new todo to appear
expect(await page.locator('[data-testid="todo-1"]').textContent()).toContain('New Todo');

// Wait for API response
await page.waitForResponse(response => 
  response.url().includes('/api/todos') && response.status() === 200
);

// Wait for element to be removed
await page.waitForSelector('[data-testid="todo-1"]', { state: 'detached' });

// ❌ BAD - Arbitrary timeout
await page.click('[data-testid="add-todo-button"]');
await page.waitForTimeout(2000); // Might be too short or unnecessarily long
```

**Related Files**: 
- `packages/frontend/tests/ui/e2e.spec.js` - Playwright test examples

**Notes**: 
- Use `waitForSelector`, `waitForResponse`, `waitForLoadState`
- Playwright has built-in auto-waiting for most actions
- Fixed timeouts should only be used as last resort
- State-based waits are faster and more reliable

---

### Error Response Consistency Pattern

**Context**: Code review and quality improvement workflows

**Problem**: Lint errors and code quality issues accumulate and become overwhelming. Fixing them one-by-one is inefficient and error-prone.

**Solution**: Use systematic categorization and batch fixing:
1. **Gather**: Run linter and collect all errors
2. **Categorize**: Group by type (unused-vars, no-console, etc.)
3. **Prioritize**: Critical → High → Medium → Low
4. **Batch Fix**: Fix all instances of same type together
5. **Validate**: Run tests to ensure nothing broke

**Example**:
```bash
# Step 1: Gather
$ npm run lint
  12 errors, 5 warnings

# Step 2: Categorize
  - no-unused-vars: 7 occurrences (Medium)
  - no-console: 4 occurrences (Low)
  - semi: 1 occurrence (Low)

# Step 3: Prioritize & batch fix
  Fix all unused-vars first → Run tests → Commit
  Fix all console logs next → Run tests → Commit
  Fix semicolons last → Run tests → Commit

# Step 4: Validate
$ npm test
  All tests passing ✓
```

**Related Files**: 
- `.github/agents/code-reviewer.agent.md` - Systematic review workflow

**Notes**: 
- Batch fixing is faster than one-by-one
- Running tests between batches catches breaking changes early
- Small commits make it easy to revert if needed
- Document recurring patterns in patterns-discovered.md to prevent future issues

---

### Early Return Pattern (Guard Clauses)

**Context**: Functions with multiple conditional paths in React and Express

**Problem**: Nested conditionals create deep indentation, making code hard to read and maintain. The "happy path" gets buried in nesting.

**Solution**: Use early returns (guard clauses) to handle edge cases first, keeping the main logic at the top level.

**Example**:
```javascript
// ❌ BAD - Nested conditionals
function TodoItem({ todo, onToggle, onDelete }) {
  if (todo) {
    if (todo.id) {
      return (
        <div>
          <input 
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
          />
          <span>{todo.title}</span>
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </div>
      );
    } else {
      return <div>Invalid todo: missing ID</div>;
    }
  } else {
    return <div>No todo provided</div>;
  }
}

// ✅ GOOD - Early returns
function TodoItem({ todo, onToggle, onDelete }) {
  if (!todo) {
    return <div>No todo provided</div>;
  }
  
  if (!todo.id) {
    return <div>Invalid todo: missing ID</div>;
  }
  
  // Happy path at top level - easy to read
  return (
    <div>
      <input 
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.title}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </div>
  );
}
```

**Related Files**: 
- Common pattern in React components
- Express route handlers also benefit from this pattern

**Notes**: 
- Reduces cognitive load by handling edge cases upfront
- Main logic stays at lowest indentation level
- Makes function flow easier to understand
- Especially valuable in components with multiple validation checks

---

### Page Object Model (POM) for UI Tests

**Context**: Playwright end-to-end tests for UI journeys

**Problem**: Duplicating selectors and interaction logic across multiple tests creates maintenance nightmares. When UI changes, every test needs updates. Tests become brittle and hard to read.

**Solution**: Use Page Object Model to centralize UI interactions and selectors in reusable page classes. Tests focus on scenario intent and assertions, page objects handle how to interact with the UI.

**Example**:
```javascript
// ✅ GOOD - Page Object centralizes UI knowledge
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

  async getTodoText(id) {
    return await this.page.textContent(this.selectors.todoItem(id));
  }
}

// e2e.spec.js - Test is readable and focused
import { TodoPage } from './pages/TodoPage';

test('should create a todo', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.addTodo('Buy milk');
  expect(await todoPage.getTodoText(1)).toContain('Buy milk');
});

// ❌ BAD - Selectors duplicated across tests
test('test 1', async ({ page }) => {
  await page.fill('[data-testid="todo-input"]', 'Buy milk');
  await page.click('[data-testid="add-button"]');
});

test('test 2', async ({ page }) => {
  await page.fill('[data-testid="todo-input"]', 'Buy eggs');
  await page.click('[data-testid="add-button"]');
});
// When selector changes, must update everywhere!
```

**Related Files**: 
- `packages/frontend/tests/ui/` - Playwright test location
- `.github/agents/test-engineer.agent.md` - POM patterns and guidance

**Notes**: 
- Centralizes selectors in one place (easy to update)
- Reusable methods reduce duplication
- Tests become more readable (intent vs implementation)
- Page objects can be composed for complex flows
- Include state-based waits in page object methods

---

### Test Failure Classification Pattern

**Context**: Debugging failing integration and UI tests

**Problem**: When tests fail, it's unclear whether the issue is in the application code, test code, or environment. This leads to wasted time debugging the wrong layer or assigning to the wrong person.

**Solution**: Systematically classify each failure into one of three categories based on symptoms, then provide specific diagnosis and handoff instructions.

**Example**:
```markdown
❌ Test Failure: "should delete todo on button click"
Error: Todo still appears after delete button clicked

Classification Process:
1. Check browser console → No errors (not environment)
2. Check test selectors → Correct (not test defect)
3. Check network tab → DELETE returns 200 but todo still in response
4. Classification: 🐛 APPLICATION DEFECT

Diagnosis:
- Backend DELETE endpoint returns success but doesn't remove from array
- Business logic bug in `packages/backend/src/app.js`

Action:
- Handoff to @tdd-developer to fix DELETE implementation
- Test is correct and should remain failing until fixed

Categories:
🐛 APPLICATION DEFECT - Business logic broken, API error, feature doesn't work
🧪 TEST DEFECT - Wrong selector, bad assertion, test logic error
🌍 ENVIRONMENT DEFECT - Service not running, network issue, CI config
```

**Related Files**: 
- `.github/agents/test-engineer.agent.md` - Failure classification workflow

**Notes**: 
- Saves time by identifying root cause quickly
- Clear handoff prevents miscommunication
- Prevents fixing test when application is broken (or vice versa)
- Environment issues often require infra/DevOps help
- Document common patterns for faster future diagnosis

---

### State-Based Waits (No Arbitrary Timeouts)

**Context**: Playwright UI tests and React Testing Library async operations

**Problem**: Using arbitrary timeouts (`waitForTimeout(2000)`) makes tests slow and flaky. Tests fail intermittently when operations take longer than expected, or waste time waiting longer than necessary.

**Solution**: Wait for specific application state changes instead of fixed time periods. Use Playwright's built-in state detection and React Testing Library's `findBy*` queries.

**Example**:
```javascript
// ✅ GOOD - Wait for specific state
// Playwright: Wait for element to appear
await page.click('[data-testid="add-button"]');
await page.waitForSelector('[data-testid="todo-1"]'); // Waits only as long as needed

// Wait for element to disappear
await page.click('[data-testid="delete-1"]');
await page.waitForSelector('[data-testid="todo-1"]', { state: 'detached' });

// Wait for API response
await page.waitForResponse(response => 
  response.url().includes('/api/todos') && response.status() === 200
);

// React Testing Library: Wait for async element
const errorMessage = await screen.findByText(/error occurred/i);
// findBy* automatically waits up to 1000ms

// ❌ BAD - Arbitrary timeout
await page.click('[data-testid="add-button"]');
await page.waitForTimeout(2000); // Might be too short or too long
```

**Related Files**: 
- `packages/frontend/tests/ui/` - Playwright tests should use state-based waits
- `.github/agents/test-engineer.agent.md` - Wait strategies documented

**Notes**: 
- Tests run faster (no unnecessary waiting)
- More reliable (waits exactly as long as needed)
- Better error messages when state never occurs
- Playwright has smart defaults (auto-waits for most actions)
- Use `networkidle` for page loads, not fixed timeouts

---

### Test Isolation with Setup/Teardown

**Context**: Backend integration tests and React component tests

**Problem**: Tests that share state or depend on execution order are flaky and hard to debug. One test's failure causes cascading failures in others. Can't run tests individually or in random order.

**Solution**: Each test sets up its own prerequisites and cleans up after itself. Use `beforeEach` for setup and `afterEach` for teardown to ensure isolation.

**Example**:
```javascript
// ✅ GOOD - Isolated tests with setup/teardown
describe('Todo API', () => {
  let originalTodos;
  
  beforeEach(() => {
    // Each test gets fresh state
    originalTodos = [...app.locals.todos];
    app.locals.todos = [];
  });
  
  afterEach(() => {
    // Restore state for next test
    app.locals.todos = originalTodos;
  });

  it('should create a todo', async () => {
    const response = await request(app)
      .post('/todos')
      .send({ title: 'Test' });
    expect(response.status).toBe(201);
    expect(app.locals.todos).toHaveLength(1);
  });

  it('should delete a todo', async () => {
    // This test is independent - sets up its own data
    app.locals.todos = [{ id: 1, title: 'Test', completed: false }];
    
    const response = await request(app).delete('/todos/1');
    expect(response.status).toBe(200);
    expect(app.locals.todos).toHaveLength(0);
  });
});

// ❌ BAD - Tests depend on each other
describe('Todo API', () => {
  it('should create a todo', async () => {
    await request(app).post('/todos').send({ title: 'Test' });
    // Leaves todo in state!
  });

  it('should delete a todo', async () => {
    // Depends on previous test creating the todo
    await request(app).delete('/todos/1');
    // Fails if previous test didn't run!
  });
});
```

**Related Files**: 
- `packages/backend/__tests__/` - Backend test isolation
- `packages/frontend/src/__tests__/` - Frontend test isolation

**Notes**: 
- Each test can run independently
- Can run single test in isolation
- Can run tests in any order
- Test failures don't cascade
- Mock functions need `jest.clearAllMocks()` in beforeEach
- Playwright tests automatically get isolated browser context

---

<!-- Add new patterns below this line -->
