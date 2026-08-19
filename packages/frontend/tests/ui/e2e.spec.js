/**
 * End-to-End UI Tests for TODO Application
 * Tests critical user journeys using Page Object Model
 * 
 * Test Limit: Maximum 5 tests (strictly enforced)
 * Error Path: At least 1 error scenario test included
 */

const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

test.describe('TODO Application - Critical User Journeys', () => {
  let todoPage;

  test.beforeEach(async ({ page }) => {
    // Each test gets fresh state - ensures isolation
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.clearAllTodos();
    await todoPage.page.reload();
    await todoPage.page.waitForLoadState('networkidle');
  });

  /**
   * Test 1: Create Todo (Critical Happy Path)
   * Validates basic create functionality
   */
  test('should create a new todo', async () => {
    // Arrange
    const todoText = 'Buy groceries';

    // Act
    await todoPage.addTodo(todoText);
    const todoId = await todoPage.getFirstTodoId();
    await todoPage.waitForTodo(todoId);

    // Assert
    const count = await todoPage.getTodoCount();
    expect(count).toBe(1);
    
    const text = await todoPage.getTodoText(todoId);
    expect(text).toContain(todoText);
    
    const isCompleted = await todoPage.isTodoCompleted(todoId);
    expect(isCompleted).toBe(false);
  });

  /**
   * Test 2: Toggle Todo Completion (Critical Happy Path)
   * Validates completion state management
   */
  test('should toggle todo completion status', async () => {
    // Arrange - create a todo first
    await todoPage.addTodo('Complete this task');
    const todoId = await todoPage.getFirstTodoId();
    await todoPage.waitForTodo(todoId);

    // Act - toggle to completed
    await todoPage.toggleTodo(todoId);

    // Assert - should be completed (line-through)
    let isCompleted = await todoPage.isTodoCompleted(todoId);
    expect(isCompleted).toBe(true);

    // Act - toggle back to incomplete
    await todoPage.toggleTodo(todoId);

    // Assert - should not be completed
    isCompleted = await todoPage.isTodoCompleted(todoId);
    expect(isCompleted).toBe(false);
  });

  /**
   * Test 3: Persist Todos After Refresh (Critical Data Integrity)
   * Validates that data persists across page reloads
   */
  test('should persist todos after page refresh', async () => {
    // Arrange - create multiple todos
    await todoPage.addTodo('First todo');
    const firstId = await todoPage.getFirstTodoId();
    await todoPage.waitForTodo(firstId);
    
    await todoPage.addTodo('Second todo');
    // Wait for list to have 2 todos
    await todoPage.page.waitForFunction(() => {
      const items = document.querySelectorAll('[data-testid^="todo-item-"]');
      return items.length === 2;
    });
    const secondId = await todoPage.getTodoIdByIndex(1);
    await todoPage.waitForTodo(secondId);

    // Verify initial state
    let count = await todoPage.getTodoCount();
    expect(count).toBe(2);

    // Act - reload the page
    await todoPage.reload();

    // Assert - todos should still be there
    count = await todoPage.getTodoCount();
    expect(count).toBe(2);
    
    const firstText = await todoPage.getTodoText(firstId);
    expect(firstText).toContain('First todo');
    
    const secondText = await todoPage.getTodoText(secondId);
    expect(secondText).toContain('Second todo');
  });

  /**
   * Test 4: Delete Todo (Critical Destroy Operation)
   * Validates todo deletion and list updates
   */
  test('should delete a todo', async () => {
    // Arrange - create two todos
    await todoPage.addTodo('Keep this todo');
    const firstId = await todoPage.getFirstTodoId();
    await todoPage.waitForTodo(firstId);
    
    await todoPage.addTodo('Delete this todo');
    // Wait for list to have 2 todos before getting second ID
    await todoPage.page.waitForFunction(() => {
      const items = document.querySelectorAll('[data-testid^="todo-item-"]');
      return items.length === 2;
    });
    const secondId = await todoPage.getTodoIdByIndex(1);
    await todoPage.waitForTodo(secondId);

    // Verify initial state
    let count = await todoPage.getTodoCount();
    expect(count).toBe(2);

    // Act - delete the second todo
    await todoPage.deleteTodo(secondId);

    // Assert - only one todo remains
    count = await todoPage.getTodoCount();
    expect(count).toBe(1);
    
    // Assert - correct todo was deleted (first one remains)
    const remainingText = await todoPage.getTodoText(firstId);
    expect(remainingText).toContain('Keep this todo');
  });

  /**
   * Test 5: Handle Network Errors (Critical Error Path)
   * Validates error handling when API is unavailable
   */
  test('should handle network errors gracefully', async ({ page }) => {
    // Arrange - intercept API calls to simulate network failure
    await page.route('**/api/todos', route => {
      route.abort('failed');
    });

    // Act - navigate to app with failing API
    const errorPage = new TodoPage(page);
    await errorPage.goto();

    // Assert - error message should be displayed
    const errorMessage = await page.locator('text=/failed to load todos/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    expect(await errorMessage.isVisible()).toBe(true);
  });
});
