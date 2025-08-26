import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainSidebar from '../../components/MainSidebar';

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

describe('MainSidebar', () => {
  it('renders navigation sections', () => {
    render(<MainSidebar />);

    expect(screen.getByText('Master Configuration')).toBeInTheDocument();
    expect(screen.getByText('Outbound Configuration')).toBeInTheDocument();
    expect(screen.getByText('Outbound Configuration V0.5')).toBeInTheDocument();
  });

  it('shows mobile overlay when isMobileOpen is true', () => {
    render(<MainSidebar isMobileOpen={true} />);

    const overlay = screen.getByRole('navigation');
    expect(overlay).toHaveClass('translate-x-0');
  });

  it('hides mobile sidebar when isMobileOpen is false', () => {
    render(<MainSidebar isMobileOpen={false} />);

    const sidebar = screen.getByRole('navigation');
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('calls onMobileClose when close button is clicked', async () => {
    const mockClose = vi.fn();
    
    // Mock window.innerWidth to simulate mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    render(<MainSidebar isMobileOpen={true} onMobileClose={mockClose} />);

    const closeButton = screen.getByLabelText('Close navigation menu');
    fireEvent.click(closeButton);

    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('expands and collapses sections', () => {
    render(<MainSidebar />);

    const sectionButton = screen.getByLabelText('Collapse Master Configuration section');
    expect(sectionButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(sectionButton);
    expect(sectionButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<MainSidebar />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');

    const collapseButton = screen.getByLabelText(/Collapse sidebar|Expand sidebar/);
    expect(collapseButton).toHaveAttribute('aria-expanded');
  });

  it('shows step badges for outbound configuration items', () => {
    render(<MainSidebar />);

    expect(screen.getByText('1')).toBeInTheDocument(); // Inventory Groups badge
    expect(screen.getByText('2')).toBeInTheDocument(); // Wave Planning badge
    expect(screen.getByText('6')).toBeInTheDocument(); // Review & Confirm badge
  });

  it('highlights active navigation item', () => {
    render(<MainSidebar currentPath="/step/1" />);

    const inventoryGroupsButton = screen.getByText('Inventory Groups').closest('button');
    expect(inventoryGroupsButton).toHaveClass('bg-black', 'text-white');
    expect(inventoryGroupsButton).toHaveAttribute('aria-current', 'page');
  });

  it('handles keyboard navigation with Escape key', async () => {
    const mockClose = vi.fn();
    
    render(<MainSidebar isMobileOpen={true} onMobileClose={mockClose} />);

    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(mockClose).toHaveBeenCalledOnce();
    });
  });
});