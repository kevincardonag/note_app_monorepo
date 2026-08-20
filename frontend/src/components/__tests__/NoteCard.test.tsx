import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from '../NoteCard';

describe('NoteCard', () => {
  const mockNote = {
    id: 'note-123',
    title: 'Grocery Shopping',
    content: 'Apples, Bananas, Milk, Bread, Cheese, Butter, Oats',
    category: {
      id: 'cat-1',
      name: 'Personal',
      color_hex: '#FF6B6B',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  it('renders note title, content, and category badge with color', () => {
    const handleClick = vi.fn();
    render(<NoteCard note={mockNote} onClick={handleClick} />);

    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
    expect(screen.getByText(/Apples, Bananas/)).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(<NoteCard note={mockNote} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Enter and Space key down', () => {
    const handleClick = vi.fn();
    render(<NoteCard note={mockNote} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);

    // Other keys do not trigger onClick
    fireEvent.keyDown(card, { key: 'ArrowDown' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('renders fallbacks when category, title, or content are missing', () => {
    const fallbackNote = {
      id: 'note-empty',
      title: '',
      content: '',
      category: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    render(<NoteCard note={fallbackNote} onClick={vi.fn()} />);
    expect(screen.getByText('Note Title')).toBeInTheDocument();
    expect(screen.getByText('Note content...')).toBeInTheDocument();
  });
});
