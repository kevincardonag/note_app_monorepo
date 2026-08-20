'use client';

import { formatNoteDate } from '@/lib/date-utils';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category?: {
    id: string;
    name: string;
    color_hex: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface NoteCardProps {
  note: NoteItem;
  onClick: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const formattedDate = formatNoteDate(note.created_at || note.updated_at);
  const categoryColor = note.category?.color_hex || '#EF9C66';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        borderColor: categoryColor,
        backgroundColor: `${categoryColor}40`,
      }}
      className="group relative flex h-[210px] cursor-pointer flex-col justify-between rounded-[11px] border border-[1.5px] p-4 text-left transition-all duration-200 hover:scale-[1.01] hover:shadow-md sm:h-[230px] sm:p-5"
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Card Header: month/day + category name (Figma Node 2:38) */}
        <div className="mb-2.5 flex items-center justify-between gap-2 sm:mb-3">
          <span className="text-xs font-bold text-[#2D1F17]">
            {formattedDate}
          </span>
          {note.category && (
            <span className="truncate text-xs font-normal text-[#2D1F17]/80">
              {note.category.name}
            </span>
          )}
        </div>

        {/* Note Title (Inria Serif 24px Bold in Figma) */}
        <h3 className="mb-1.5 line-clamp-2 font-serif text-lg leading-snug font-bold tracking-tight text-[#2D1F17] sm:mb-2 sm:text-2xl">
          {note.title || 'Note Title'}
        </h3>

        {/* Note Body Preview */}
        <p className="line-clamp-3 flex-1 text-xs leading-relaxed font-normal whitespace-pre-wrap text-[#4A3B32] sm:line-clamp-4 sm:text-sm">
          {note.content || 'Note content... '}
        </p>
      </div>
    </div>
  );
}
