import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteEditorModal } from '../NoteEditorModal';

describe('NoteEditorModal', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Personal', color_hex: '#FF6B6B' },
    { id: 'cat-2', name: 'School', color_hex: '#4ECDC4' },
  ];

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <NoteEditorModal
        isOpen={false}
        onClose={vi.fn()}
        categories={mockCategories}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders inputs and updates fields when typing', () => {
    render(
      <NoteEditorModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
      />
    );

    const titleInput = screen.getByPlaceholderText(/note title/i);
    const contentInput = screen.getByPlaceholderText(/pour your heart out/i);

    fireEvent.change(titleInput, { target: { value: 'My New Idea' } });
    expect(titleInput).toHaveValue('My New Idea');

    fireEvent.change(contentInput, {
      target: { value: 'Some detailed idea content' },
    });
    expect(contentInput).toHaveValue('Some detailed idea content');
  });

  it('changes category dropdown selection', () => {
    render(
      <NoteEditorModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
      />
    );

    const trigger = screen.getByRole('button', { name: /category selector/i });
    expect(trigger).toHaveTextContent('Personal');

    fireEvent.click(trigger);

    const schoolOption = screen.getByRole('button', { name: /^school$/i });
    fireEvent.click(schoolOption);

    expect(trigger).toHaveTextContent('School');
  });
});
