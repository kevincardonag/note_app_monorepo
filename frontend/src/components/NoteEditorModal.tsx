'use client';

import { useState, useEffect, useTransition, useCallback, useRef } from 'react';
import { X, Trash2, Check, Loader2, AlertTriangle } from 'lucide-react';
import { updateNoteAction, deleteNoteAction } from '@/app/actions/notes';
import { CategoryDropdown } from './CategoryDropdown';
import type { NoteItem } from './NoteCard';

export interface CategoryItem {
  id: string;
  name: string;
  color_hex: string;
}

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note?: NoteItem | null;
  categories: CategoryItem[];
}

function formatEditorDate(dateInput?: string | Date | null): string {
  if (!dateInput) return 'Just now';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return 'Just now';

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const month = monthNames[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${month} ${day}, ${year} at ${hours}:${minutes}${ampm}`;
}

export function NoteEditorModal({
  isOpen,
  onClose,
  note,
  categories,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [categoryId, setCategoryId] = useState<string | null>(
    note?.category?.id || (categories[0]?.id ?? null)
  );
  const [lastEdited, setLastEdited] = useState<string>(
    formatEditorDate(note?.updated_at)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Refs to keep track of the latest values for the flush on close
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const categoryIdRef = useRef(categoryId);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if there are unsaved changes
  const hasUnsavedChangesRef = useRef(false);

  // Flush function to save immediately
  const flushSave = useCallback(async () => {
    if (!note?.id || !hasUnsavedChangesRef.current) return;

    // Clear any pending timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setIsSaving(true);
    hasUnsavedChangesRef.current = false;
    setHasUnsavedChanges(false);

    try {
      await updateNoteAction(note.id, {
        title: titleRef.current.trim() || '',
        content: contentRef.current,
        category_id: categoryIdRef.current,
      });
      setLastEdited(formatEditorDate(new Date()));
    } catch (err) {
      console.error('Save note error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [note]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChangesRef.current) {
      // Trigger a synchronous fire-and-forget save before closing
      if (note?.id) {
        updateNoteAction(note.id, {
          title: titleRef.current.trim() || '',
          content: contentRef.current,
          category_id: categoryIdRef.current,
        }).catch(console.error);
      }
    }
    onClose();
  }, [onClose, note]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending && !showDeleteConfirm) {
        handleClose();
      }
    },
    [handleClose, isPending, showDeleteConfirm]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const selectedCategory =
    categories.find((c) => c.id === categoryId) || categories[0];
  const themeColor = selectedCategory?.color_hex || '#EF9C66';

  const triggerDebouncedSave = () => {
    hasUnsavedChangesRef.current = true;
    setHasUnsavedChanges(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      flushSave();
    }, 700);
  };

  const handleTextChange = (type: 'title' | 'content', val: string) => {
    if (type === 'title') {
      setTitle(val);
      titleRef.current = val;
    } else {
      setContent(val);
      contentRef.current = val;
    }
    triggerDebouncedSave();
  };

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    categoryIdRef.current = newCatId;
    hasUnsavedChangesRef.current = true;
    setHasUnsavedChanges(true);
    // Instant save for category
    flushSave();
  };

  const handleDelete = () => {
    if (!note?.id) return;

    startTransition(async () => {
      try {
        await deleteNoteAction(note.id);
        onClose();
      } catch (err) {
        console.error('Delete note error:', err);
      }
    });
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex h-screen w-full flex-col overflow-hidden bg-[#FAF1E3] p-0 duration-150 sm:p-6 md:p-10">
      {/* Top Action Bar (Full screen header) */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between p-4 pb-3 sm:p-0 sm:pb-6">
        {/* Category Dropdown */}
        <CategoryDropdown
          categories={categories}
          selectedCategoryId={categoryId}
          onSelectCategory={handleCategoryChange}
        />

        {/* Action Buttons: Delete, Close */}
        <div className="flex items-center gap-2 sm:gap-3">
          {note?.id && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              className="cursor-pointer rounded-full p-2 text-[#88642A] transition hover:bg-black/5 hover:text-red-700"
              title="Delete note"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close editor"
            className="cursor-pointer rounded-full p-2 text-[#88642A] transition hover:bg-black/5 hover:text-[#000000]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Full-Screen Note Canvas (Figma 2:8568 & 12:237) */}
      <div
        className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-y-auto rounded-none p-5 shadow-sm transition-colors duration-300 sm:rounded-[11px] sm:p-8 md:p-12"
        style={{
          backgroundColor: themeColor,
        }}
      >
        {/* 1. Last Edited / Saving indicator */}
        <div className="mb-3 ml-auto flex items-center gap-2 self-end text-right text-xs font-normal text-[#000000] select-none sm:mb-4">
          {isSaving ? (
            <span className="flex items-center gap-1.5 opacity-70">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 opacity-70">
              {hasUnsavedChanges ? '' : <Check className="h-3 w-3" />}
              {hasUnsavedChanges
                ? 'Unsaved changes'
                : `Last Edited: ${lastEdited}`}
            </span>
          )}
        </div>

        {/* 2. Note Title (Inria Serif 24px/30px Bold in Figma) */}
        <input
          type="text"
          placeholder="Note Title"
          aria-label="Note Title"
          value={title}
          onChange={(e) => handleTextChange('title', e.target.value)}
          className="mb-3 w-full border-none bg-transparent p-0 font-serif text-xl font-bold tracking-tight text-[#000000] placeholder-[#000000]/45 focus:outline-none sm:mb-4 sm:text-2xl md:text-3xl"
        />

        {/* 3. Note Body (Inter 16px Regular, placeholder 'Pour your heart out...') */}
        <textarea
          placeholder="Pour your heart out..."
          aria-label="Note Content"
          value={content}
          onChange={(e) => handleTextChange('content', e.target.value)}
          className="min-h-[240px] w-full flex-1 resize-none border-none bg-transparent p-0 text-sm leading-relaxed text-[#000000] placeholder-[#000000]/45 focus:outline-none sm:min-h-[350px] sm:text-base"
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-[#957139]/30 bg-[#FAF1E3] p-6 text-[#4A3B32] shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2D1F17]">
                  Delete Note
                </h3>
                <p className="text-xs text-[#4A3B32]/80">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isPending}
                className="cursor-pointer rounded-full px-4 py-2 text-xs font-semibold text-[#4A3B32] transition hover:bg-[#957139]/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
