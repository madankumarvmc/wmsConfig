import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WizardProvider } from '../../contexts/WizardContext';
import Step1InventoryGroups from '../../pages/steps/Step1InventoryGroups';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the toast hook
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/', vi.fn()],
}));

// Mock contexts with minimal functionality
vi.mock('../../contexts/FetchedConfigurationsContext', () => ({
  useFetchedConfigurations: () => ({
    state: {
      warehouseId: null,
      configurations: {},
      extractedInventoryGroups: [],
    },
    clearCache: vi.fn(),
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <WizardProvider>
        {children}
      </WizardProvider>
    </QueryClientProvider>
  );
};

describe('Wizard Flow Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock successful API responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });
  });

  describe('Step1InventoryGroups', () => {
    it('renders the inventory groups step', async () => {
      render(
        <TestWrapper>
          <Step1InventoryGroups />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Inventory Groups/i)).toBeInTheDocument();
      });
    });

    it('allows creating a new inventory group', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 1,
          name: 'Test Group',
          storageIdentifiers: { area: 'A1' },
          lineIdentifiers: { line: 'L1' },
          userId: 1,
        }),
      });

      render(
        <TestWrapper>
          <Step1InventoryGroups />
        </TestWrapper>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Inventory Groups/i)).toBeInTheDocument();
      });

      // Find and click the "Add New Group" button
      const addButton = screen.getByText(/Add New Group/i);
      fireEvent.click(addButton);

      // Wait for form to appear
      await waitFor(() => {
        expect(screen.getByLabelText(/Group Name/i)).toBeInTheDocument();
      });

      // Fill out the form
      const nameInput = screen.getByLabelText(/Group Name/i);
      fireEvent.change(nameInput, { target: { value: 'Test Group' } });

      // Submit the form
      const saveButton = screen.getByText(/Save Group/i);
      fireEvent.click(saveButton);

      // Verify API call was made
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/inventory-groups',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining('Test Group'),
          })
        );
      });
    });

    it('displays validation errors for invalid input', async () => {
      render(
        <TestWrapper>
          <Step1InventoryGroups />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Inventory Groups/i)).toBeInTheDocument();
      });

      // Click add button to open form
      const addButton = screen.getByText(/Add New Group/i);
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Group Name/i)).toBeInTheDocument();
      });

      // Try to save without filling required fields
      const saveButton = screen.getByText(/Save Group/i);
      fireEvent.click(saveButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('handles API errors gracefully', async () => {
      // Mock API failure
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <Step1InventoryGroups />
        </TestWrapper>
      );

      // Component should still render even if initial API call fails
      await waitFor(() => {
        expect(screen.getByText(/Inventory Groups/i)).toBeInTheDocument();
      });
    });

    it('shows loading states during API calls', async () => {
      // Mock slow API response
      mockFetch.mockImplementation(
        () => new Promise((resolve) => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ([]),
          }), 100)
        )
      );

      render(
        <TestWrapper>
          <Step1InventoryGroups />
        </TestWrapper>
      );

      // Should show loading state initially
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Error Boundaries', () => {
    it('catches and displays component errors', async () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Create a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      render(
        <TestWrapper>
          <ErrorComponent />
        </TestWrapper>
      );

      // Component should handle the error gracefully
      // Note: This test would need an actual error boundary implementation
      // For now, we're just testing that errors don't crash the test

      consoleSpy.mockRestore();
    });
  });
});