import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TopNavbar from '../../components/TopNavbar';
import { WizardProvider } from '../../contexts/WizardContext';
import { FetchedConfigurationsProvider } from '../../contexts/FetchedConfigurationsContext';

// Mock the toast hook
vi.mock('../../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the wouter hook
vi.mock('wouter', () => ({
  useLocation: () => ['/', vi.fn()],
}));

// Mock the logo import
vi.mock('@assets/sbx_logo.png', () => ({
  default: 'mock-logo.png',
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
        <FetchedConfigurationsProvider>
          {children}
        </FetchedConfigurationsProvider>
      </WizardProvider>
    </QueryClientProvider>
  );
};

describe('TopNavbar', () => {
  it('renders the SBX logo and title', () => {
    render(
      <TestWrapper>
        <TopNavbar />
      </TestWrapper>
    );

    expect(screen.getByAltText('SBX Logo')).toBeInTheDocument();
    expect(screen.getByText(/SBX Warehouse Configuration Portal/i)).toBeInTheDocument();
  });

  it('shows mobile hamburger menu when onMenuClick is provided', () => {
    const mockMenuClick = vi.fn();
    
    render(
      <TestWrapper>
        <TopNavbar onMenuClick={mockMenuClick} />
      </TestWrapper>
    );

    const hamburgerButton = screen.getByLabelText('Open navigation menu');
    expect(hamburgerButton).toBeInTheDocument();
    
    fireEvent.click(hamburgerButton);
    expect(mockMenuClick).toHaveBeenCalledOnce();
  });

  it('renders warehouse code input on desktop', () => {
    render(
      <TestWrapper>
        <TopNavbar />
      </TestWrapper>
    );

    // This should be hidden on mobile, visible on desktop
    const warehouseInput = screen.getByLabelText('Warehouse Code:');
    expect(warehouseInput).toBeInTheDocument();
  });

  it('renders default action buttons when no custom buttons provided', () => {
    render(
      <TestWrapper>
        <TopNavbar />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Save draft')).toBeInTheDocument();
    expect(screen.getByLabelText('Export configuration as JSON')).toBeInTheDocument();
    expect(screen.getByLabelText('User account menu')).toBeInTheDocument();
  });

  it('renders custom buttons when provided', () => {
    const customButton = {
      icon: <span>👍</span>,
      label: 'Custom Action',
      onClick: vi.fn(),
    };

    render(
      <TestWrapper>
        <TopNavbar rightButtons={[customButton]} />
      </TestWrapper>
    );

    expect(screen.getByText('Custom Action')).toBeInTheDocument();
    
    // Default buttons should not be rendered when custom buttons are provided
    expect(screen.queryByLabelText('Save draft')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <TopNavbar />
      </TestWrapper>
    );

    const nav = screen.getByRole('banner');
    expect(nav).toBeInTheDocument();

    const warehouseInput = screen.getByLabelText('Warehouse Code:');
    expect(warehouseInput).toHaveAttribute('aria-describedby', 'warehouse-code-help');
  });
});