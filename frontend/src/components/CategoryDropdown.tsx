'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { CategoryItem } from './NoteEditorModal';

interface CategoryDropdownProps {
  categories: CategoryItem[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryDropdown({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCategory =
    categories.find((c) => c.id === selectedCategoryId) || categories[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Category Dropdown Trigger (Figma: stroke #957139, radius 6px) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Category selector"
        aria-expanded={isOpen}
        className="flex cursor-pointer items-center gap-2.5 rounded-[6px] border border-[#957139] bg-transparent px-3 py-1.5 transition-colors hover:bg-[#957139]/10"
      >
        <span
          className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
          style={{ backgroundColor: selectedCategory?.color_hex || '#EF9C66' }}
        />
        <span className="text-xs font-normal text-[#000000]">
          {selectedCategory?.name || 'Select Category'}
        </span>
        <ChevronDown className="ml-0.5 h-3.5 w-3.5 text-[#957139]" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="animate-in fade-in zoom-in-95 absolute top-full left-0 z-50 mt-1.5 w-48 rounded-[8px] border border-[#957139]/40 bg-[#FAF1E3] py-1.5 shadow-lg duration-100">
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCategory?.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id);
                  setIsOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#957139]/15 font-semibold text-[#000000]'
                    : 'text-[#4A3B32] hover:bg-[#957139]/10'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: cat.color_hex }}
                />
                <span className="truncate">{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
