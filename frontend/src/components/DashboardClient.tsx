'use client';

import { useState, useMemo, useTransition } from 'react';
import Image from 'next/image';
import { Plus, LogOut, Loader2 } from 'lucide-react';
import { NoteCard, type NoteItem } from './NoteCard';
import { NoteEditorModal, type CategoryItem } from './NoteEditorModal';
import { logoutAction } from '@/app/actions/auth';
import { createNoteAction } from '@/app/actions/notes';

interface DashboardClientProps {
  initialNotes: NoteItem[];
  categories: CategoryItem[];
  userEmail?: string;
}

export function DashboardClient({
  initialNotes,
  categories,
  userEmail,
}: DashboardClientProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Compute note count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      counts[cat.id] = 0;
    }
    for (const note of initialNotes) {
      if (note.category?.id && counts[note.category.id] !== undefined) {
        counts[note.category.id]++;
      }
    }
    return counts;
  }, [categories, initialNotes]);

  // Filter notes by selected category and sort chronologically (newest first)
  const filteredNotes = useMemo(() => {
    const notes = !selectedCategoryId
      ? initialNotes
      : initialNotes.filter((note) => note.category?.id === selectedCategoryId);

    return [...notes].sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at).getTime();
      const dateB = new Date(b.created_at || b.updated_at).getTime();
      return dateB - dateA;
    });
  }, [initialNotes, selectedCategoryId]);

  const [isPending, startTransition] = useTransition();

  const handleOpenNewNote = () => {
    startTransition(async () => {
      try {
        // Always default to the user's primary category (categories[0])
        const targetCategoryId = categories[0]?.id;

        const newNote = await createNoteAction({
          title: '',
          content: '',
          category_id: targetCategoryId || undefined,
        });
        setActiveNote(newNote);
        setIsModalOpen(true);
      } catch (err) {
        console.error('Failed to create note:', err);
      }
    });
  };

  const handleOpenEditNote = (note: NoteItem) => {
    setActiveNote(note);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FAF1E3] font-sans text-[#4A3B32]">
      {/* Sidebar (Desktop only - with vertical offset so All Categories aligns lower down) */}
      <aside className="hidden w-64 flex-shrink-0 flex-col justify-between bg-[#FAF1E3] p-6 pt-20 pb-8 pl-8 md:flex lg:w-72">
        <div>
          {/* Category List */}
          <nav className="space-y-2">
            {/* All Categories Button */}
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId(null);
                setIsModalOpen(false);
              }}
              className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                selectedCategoryId === null && !isModalOpen
                  ? 'bg-[#957139]/15 font-semibold text-[#2D1F17]'
                  : 'text-[#4A3B32] hover:bg-[#957139]/10'
              }`}
            >
              <span>All Categories</span>
              <span className="rounded-full bg-[#957139]/10 px-2 py-0.5 text-xs font-semibold text-[#88642A]">
                {initialNotes.length}
              </span>
            </button>

            {/* Dynamic Categories */}
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id && !isModalOpen;
              const count = categoryCounts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setIsModalOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    isSelected
                      ? 'bg-[#957139]/15 font-semibold text-[#2D1F17]'
                      : 'text-[#4A3B32] hover:bg-[#957139]/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 flex-shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: cat.color_hex }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className="rounded-full bg-[#957139]/10 px-2 py-0.5 text-xs font-semibold text-[#88642A]">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account / Logout Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="overflow-hidden pr-2">
            <p className="truncate text-xs font-semibold text-[#4A3B32]">
              {userEmail || 'Signed in'}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="cursor-pointer rounded-lg p-2 text-[#957139] transition hover:bg-[#957139]/10 hover:text-red-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      {isModalOpen ? (
        <NoteEditorModal
          key={activeNote?.id ?? 'new-note'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          note={activeNote}
          categories={categories}
        />
      ) : (
        <main className="flex h-full flex-1 flex-col overflow-hidden bg-[#FAF1E3]">
          {/* Mobile Header (Visible only on < md) */}
          <div className="flex items-center justify-between border-b border-[#957139]/10 px-4 pt-4 pb-2 md:hidden">
            <div className="flex max-w-[60%] items-center gap-2 overflow-hidden">
              <form action={logoutAction}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  title="Sign out"
                  className="cursor-pointer rounded-lg p-1.5 text-[#957139] transition hover:bg-[#957139]/10 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
              <p className="truncate text-xs font-semibold text-[#4A3B32]">
                {userEmail || 'Signed in'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewNote}
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#957139] bg-transparent px-3.5 py-1.5 text-xs font-bold text-[#957139] shadow-sm transition-colors duration-200 hover:bg-[#957139] hover:text-[#FAF1E3] disabled:opacity-50 sm:text-sm"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              New Note
            </button>
          </div>

          {/* Mobile Category Chips (Visible only on < md) */}
          <div className="flex flex-shrink-0 [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] md:hidden [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId(null);
                setIsModalOpen(false);
              }}
              className={`flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
                selectedCategoryId === null && !isModalOpen
                  ? 'bg-[#957139]/20 font-semibold text-[#2D1F17] ring-1 ring-[#957139]/40'
                  : 'bg-[#957139]/5 text-[#4A3B32] hover:bg-[#957139]/10'
              }`}
            >
              <span>All</span>
              <span className="py-0.2 rounded-full bg-[#957139]/15 px-1.5 text-[10px] font-semibold text-[#88642A]">
                {initialNotes.length}
              </span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id && !isModalOpen;
              const count = categoryCounts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setIsModalOpen(false);
                  }}
                  className={`flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-[#957139]/20 font-semibold text-[#2D1F17] ring-1 ring-[#957139]/40'
                      : 'bg-[#957139]/5 text-[#4A3B32] hover:bg-[#957139]/10'
                  }`}
                >
                  <span
                    className="h-2 w-2 flex-shrink-0 rounded-full border border-black/10"
                    style={{ backgroundColor: cat.color_hex }}
                  />
                  <span>{cat.name}</span>
                  <span className="py-0.2 rounded-full bg-[#957139]/15 px-1.5 text-[10px] font-semibold text-[#88642A]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop Top Action Header: New Note button on top right */}
          <header className="hidden items-center justify-end px-8 pt-8 pb-4 md:flex">
            <button
              type="button"
              onClick={handleOpenNewNote}
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#957139] bg-transparent px-6 py-2 text-base font-bold text-[#957139] shadow-sm transition-colors duration-200 hover:bg-[#957139] hover:text-[#FAF1E3] disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              New Note
            </button>
          </header>

          {/* Notes View Area (Single continuous grid without grouping titles) */}
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-6 md:px-8 md:pt-4 md:pb-8">
            {filteredNotes.length === 0 ? (
              /* Figma Empty State (Node 12:486: only cat illustration + text) */
              <div className="-mt-6 flex h-full flex-col items-center justify-center p-6 text-center md:-mt-10 md:p-8">
                <div className="relative mb-4 h-40 w-40 flex-shrink-0 sm:mb-6 sm:h-52 sm:w-52">
                  <Image
                    src="/images/empty-state-character.png"
                    alt="Empty notes illustration"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <h3 className="max-w-md font-serif text-xl leading-snug font-bold text-[#88642A] sm:text-2xl md:text-3xl">
                  I’m just here waiting for your charming notes...
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={() => handleOpenEditNote(note)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
