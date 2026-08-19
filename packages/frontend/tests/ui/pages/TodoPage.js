/**
 * TodoPage - Page Object Model for TODO application
 * Centralizes UI interactions and selectors for maintainable tests
 */

export class TodoPage {
  constructor(page) {
    this.page = page;
    
    // Centralized selectors - single source of truth
    this.selectors = {
      input: 'input[placeholder="What needs to be done?"]',
      addButton: 'button:has-text("Add")',
      todoList: '[data-testid="todo-list"]',
      todoItem: (id) => `[data-testid="todo-item-${id}"]`,
      todoTitle: (id) => `[data-testid="todo-title-${id}"]`,
      todoCheckbox: (id) => `[data-testid="todo-checkbox-${id}"]`,
      loadingSpinner: '[data-testid="loading-spinner"]',
    };
  }

  /**
   * Clear all todos from the backend (for test isolation)
   */
  async clearAllTodos() {
    // Fetch all current todos
    const response = await this.page.request.get('http://localhost:3001/api/todos');
    const todos = await response.json();
    
    // Delete each todo
    for (const todo of todos) {
      await this.page.request.delete(`http://localhost:3001/api/todos/${todo.id}`);
    }
  }

  /**
   * Navigate to the TODO application
   */
  async goto() {
    await this.page.goto('http://localhost:3000');
    // State-based wait - wait for network to be idle
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Add a new todo
   * @param {string} text - The todo text to add
   */
  async addTodo(text) {
    await this.page.fill(this.selectors.input, text);
    await this.page.click(this.selectors.addButton);
    // State-based wait - wait for todo list to update
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Toggle a todo's completion status
   * @param {number} id - The todo ID
   */
  async toggleTodo(id) {
    await this.page.click(this.selectors.todoCheckbox(id));
    // State-based wait - wait for state update
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the text of a todo
   * @param {number} id - The todo ID
   * @returns {Promise<string>} The todo text
   */
  async getTodoText(id) {
    return await this.page.textContent(this.selectors.todoTitle(id));
  }

  /**
   * Check if a todo is completed (has line-through style)
   * @param {number} id - The todo ID
   * @returns {Promise<boolean>} True if completed
   */
  async isTodoCompleted(id) {
    const element = await this.page.locator(this.selectors.todoTitle(id));
    const textDecoration = await element.evaluate(el => 
      window.getComputedStyle(el).textDecoration
    );
    return textDecoration.includes('line-through');
  }

  /**
   * Delete a todo
   * @param {number} id - The todo ID
   */
  async deleteTodo(id) {
    const deleteButton = this.page.locator(`[data-testid="todo-item-${id}"] button[aria-label*="delete" i]`).or(
      this.page.locator(`[data-testid="todo-item-${id}"] button:has-text("Delete")`).or(
        this.page.locator(`[data-testid="todo-item-${id}"] svg[data-testid="DeleteIcon"]`).locator('..')
      )
    );
    await deleteButton.click();
    // State-based wait - wait for the item to be removed
    await this.page.waitForSelector(`[data-testid="todo-item-${id}"]`, {
      state: 'detached',
      timeout: 5000
    });
  }

  /**
   * Get the count of todos in the list
   * @returns {Promise<number>} The number of todos
   */
  async getTodoCount() {
    const items = await this.page.locator('[data-testid^="todo-item-"]').all();
    return items.length;
  }

  /**
   * Get the ID of the first todo in the list
   * @returns {Promise<number>} The ID of the first todo
   */
  async getFirstTodoId() {
    const firstItem = await this.page.locator('[data-testid^="todo-item-"]').first();
    const testId = await firstItem.getAttribute('data-testid');
    return parseInt(testId.replace('todo-item-', ''));
  }

  /**
   * Get the ID of the Nth todo (0-indexed)
   * @param {number} index - The index of the todo (0-indexed)
   * @returns {Promise<number>} The ID of the todo
   */
  async getTodoIdByIndex(index) {
    const items = await this.page.locator('[data-testid^="todo-item-"]').all();
    if (index >= items.length) {
      throw new Error(`Todo at index ${index} does not exist`);
    }
    const testId = await items[index].getAttribute('data-testid');
    return parseInt(testId.replace('todo-item-', ''));
  }

  /**
   * Check if the todo list exists
   * @returns {Promise<boolean>} True if todo list is visible
   */
  async isTodoListVisible() {
    return await this.page.locator(this.selectors.todoList).isVisible();
  }

  /**
   * Check if loading spinner is visible
   * @returns {Promise<boolean>} True if loading
   */
  async isLoading() {
    return await this.page.locator(this.selectors.loadingSpinner).isVisible();
  }

  /**
   * Wait for a specific todo to appear
   * @param {number} id - The todo ID
   */
  async waitForTodo(id) {
    await this.page.waitForSelector(this.selectors.todoItem(id), {
      state: 'visible',
      timeout: 5000
    });
  }

  /**
   * Reload the page
   */
  async reload() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }
}
