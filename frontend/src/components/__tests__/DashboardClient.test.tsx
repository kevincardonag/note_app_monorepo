import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardClient } from '../DashboardClient';

// Mock the Next.js server actions and Image
vi.mock('@/app/actions/auth', () => ({
  logoutAction: vi.fn(),
}));

vi.mock('@/app/actions/notes', () => ({
  createNoteAction: vi.fn(),
  updateNoteAction: vi.fn(),
  deleteNoteAction: vi.fn(),
}));

vi.mock('next/image', () => ({
  default: ({
    alt = 'test image',
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
  }) => {
    const { fill: _, priority: __, ...cleanProps } = props;
    void _;
    void __;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} {...cleanProps} />;
  },
}));

describe('DashboardClient Component', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Work', color_hex: '#EF9C66' },
    { id: 'cat-2', name: 'Personal', color_hex: '#FCDC94' },
  ];

  const mockNotes = [
    {
      id: 'note-1',
      title: 'Work Note',
      content: 'Do work tasks',
      category: mockCategories[0],
      created_at: '2026-08-20T10:00:00Z',
      updated_at: '2026-08-20T10:00:00Z',
    },
    {
      id: 'note-2',
      title: 'Personal Note',
      content: 'Buy groceries',
      category: mockCategories[1],
      created_at: '2026-08-19T10:00:00Z',
      updated_at: '2026-08-19T10:00:00Z',
    },
  ];

  it('renders all notes and category navigation', () => {
    render(
      <DashboardClient
        initialNotes={mockNotes}
        categories={mockCategories}
        userEmail="test@example.com"
      />
    );

    // Should display both notes
    expect(screen.getByText('Work Note')).toBeInTheDocument();
    expect(screen.getByText('Personal Note')).toBeInTheDocument();

    // Should display email in both headers / sidebar
    const emailElements = screen.getAllByText('test@example.com');
    expect(emailElements.length).toBeGreaterThanOrEqual(1);

    // Should display category names
    expect(screen.getAllByText('Work').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Personal').length).toBeGreaterThanOrEqual(1);
  });

  it('filters notes when category chip or button is clicked', () => {
    render(
      <DashboardClient initialNotes={mockNotes} categories={mockCategories} />
    );

    // Click on the Work category
    const workButtons = screen.getAllByText('Work');
    fireEvent.click(workButtons[0]);

    // Work Note should be present, Personal Note should be hidden
    expect(screen.getByText('Work Note')).toBeInTheDocument();
    expect(screen.queryByText('Personal Note')).not.toBeInTheDocument();

    // Click on All / All Categories
    const allButtons = screen.getAllByText(/All/i);
    fireEvent.click(allButtons[0]);

    // Both should be visible again
    expect(screen.getByText('Work Note')).toBeInTheDocument();
    expect(screen.getByText('Personal Note')).toBeInTheDocument();
  });

  it('shows empty state illustration when no notes match category filter', () => {
    render(<DashboardClient initialNotes={[]} categories={mockCategories} />);

    expect(
      screen.getByText(/I’m just here waiting for your charming notes/i)
    ).toBeInTheDocument();
  });
});
