import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Mock fetch for tests
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
);

test('renders TODO App heading', async () => {
  const testQueryClient = createTestQueryClient();

  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );

  const headingElement = await screen.findByText(/TODO App/i);
  expect(headingElement).toBeInTheDocument();
});

test('should call DELETE API when delete button is clicked', async () => {
  const user = userEvent.setup();
  const testQueryClient = createTestQueryClient();
  
  // Mock initial fetch to return one todo
  fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, title: 'Test Todo', completed: false, createdAt: new Date().toISOString() }
      ]),
    })
  );
  
  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );
  
  // Wait for todo to appear
  const todoText = await screen.findByText('Test Todo');
  expect(todoText).toBeInTheDocument();
  
  // Mock delete call
  fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    })
  );
  
  // Mock refetch after delete
  fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );
  
  // Find and click delete button (looks for DeleteIcon in MUI IconButton)
  const deleteButtons = screen.getAllByRole('button');
  const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
  
  await user.click(deleteButton);
  
  // Verify DELETE was called with correct URL
  await waitFor(() => {
    const deleteCall = fetch.mock.calls.find(call => 
      call[0] === 'http://localhost:3001/api/todos/1' && 
      call[1]?.method === 'DELETE'
    );
    expect(deleteCall).toBeDefined();
  });
});

test('should show error message when todos fetch fails', async () => {
  const testQueryClient = createTestQueryClient();
  
  // Mock fetch to fail
  fetch.mockImplementationOnce(() =>
    Promise.reject(new Error('Network error'))
  );
  
  render(
    <QueryClientProvider client={testQueryClient}>
      <App />
    </QueryClientProvider>
  );
  
  // Wait for error message
  const errorMessage = await screen.findByText(/failed to load todos/i, {}, { timeout: 3000 });
  expect(errorMessage).toBeInTheDocument();
});

afterEach(() => {
  jest.clearAllMocks();
});
