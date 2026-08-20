import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryDropdown } from '../CategoryDropdown';

describe('CategoryDropdown', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Personal', color_hex: '#FF6B6B' },
    { id: 'cat-2', name: 'School', color_hex: '#4ECDC4' },
  ];

  it('renders selected category and toggles menu on click', () => {
    const handleSelect = vi.fn();
    render(
      <CategoryDropdown
        categories={mockCategories}
        selectedCategoryId="cat-1"
        onSelectCategory={handleSelect}
      />
    );

    const trigger = screen.getByRole('button', { name: /category selector/i });
    expect(trigger).toHaveTextContent('Personal');

    // Open dropdown
    fireEvent.click(trigger);
    expect(
      screen.getByRole('button', { name: /^school$/i })
    ).toBeInTheDocument();

    // Select new category
    fireEvent.click(screen.getByRole('button', { name: /^school$/i }));
    expect(handleSelect).toHaveBeenCalledWith('cat-2');
  });

  it('closes dropdown when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <CategoryDropdown
          categories={mockCategories}
          selectedCategoryId="cat-1"
          onSelectCategory={vi.fn()}
        />
      </div>
    );

    const trigger = screen.getByRole('button', { name: /category selector/i });
    fireEvent.click(trigger);
    expect(
      screen.getByRole('button', { name: /^school$/i })
    ).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-area'));
    expect(
      screen.queryByRole('button', { name: /^school$/i })
    ).not.toBeInTheDocument();
  });

  it('uses default fallback when selectedCategoryId is not matched', () => {
    render(
      <CategoryDropdown
        categories={mockCategories}
        selectedCategoryId="non-existent"
        onSelectCategory={vi.fn()}
      />
    );

    const trigger = screen.getByRole('button', { name: /category selector/i });
    expect(trigger).toHaveTextContent('Personal'); // falls back to categories[0]
  });
});
