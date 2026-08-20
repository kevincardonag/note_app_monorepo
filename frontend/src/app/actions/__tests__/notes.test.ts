import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNoteAction, updateNoteAction, deleteNoteAction } from '../notes';
import { getServerApiClient } from '@/lib/api';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/api', () => ({
  getServerApiClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('notes actions', () => {
  const mockPost = vi.fn();
  const mockPatch = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getServerApiClient).mockResolvedValue({
      POST: mockPost,
      PATCH: mockPatch,
      DELETE: mockDelete,
    } as unknown as Awaited<ReturnType<typeof getServerApiClient>>);
  });

  describe('createNoteAction', () => {
    it('creates note successfully and revalidates', async () => {
      const mockCreatedNote = {
        id: 'note-1',
        title: 'New Note',
        content: 'Content',
      };
      mockPost.mockResolvedValueOnce({ data: mockCreatedNote, error: null });

      const result = await createNoteAction({
        title: 'New Note',
        content: 'Content',
        category_id: 'cat-1',
      });

      expect(mockPost).toHaveBeenCalledWith('/api/notes/', {
        body: {
          title: 'New Note',
          content: 'Content',
          category_id: 'cat-1',
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(result).toEqual(mockCreatedNote);
    });

    it('throws error when API returns error', async () => {
      mockPost.mockResolvedValueOnce({
        data: null,
        error: { detail: 'Failed to create' },
      });

      await expect(createNoteAction({ title: 'Fail' })).rejects.toThrow(
        JSON.stringify({ detail: 'Failed to create' })
      );
    });
  });

  describe('updateNoteAction', () => {
    it('updates note successfully and revalidates', async () => {
      const mockUpdatedNote = {
        id: 'note-1',
        title: 'Updated',
        content: 'Updated content',
      };
      mockPatch.mockResolvedValueOnce({ data: mockUpdatedNote, error: null });

      const result = await updateNoteAction('note-1', {
        title: 'Updated',
        content: 'Updated content',
        category_id: 'cat-2',
      });

      expect(mockPatch).toHaveBeenCalledWith('/api/notes/{id}/', {
        params: { path: { id: 'note-1' } },
        body: {
          title: 'Updated',
          content: 'Updated content',
          category_id: 'cat-2',
        },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/');
      expect(result).toEqual(mockUpdatedNote);
    });

    it('throws error on API patch failure', async () => {
      mockPatch.mockResolvedValueOnce({
        data: null,
        error: { detail: 'Not found' },
      });

      await expect(
        updateNoteAction('non-existing-id', { title: 'Test' })
      ).rejects.toThrow(JSON.stringify({ detail: 'Not found' }));
    });
  });

  describe('deleteNoteAction', () => {
    it('deletes note successfully and revalidates', async () => {
      mockDelete.mockResolvedValueOnce({ error: null });

      await deleteNoteAction('note-1');

      expect(mockDelete).toHaveBeenCalledWith('/api/notes/{id}/', {
        params: { path: { id: 'note-1' } },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('throws error on API delete failure', async () => {
      mockDelete.mockResolvedValueOnce({ error: { detail: 'Forbidden' } });

      await expect(deleteNoteAction('note-1')).rejects.toThrow(
        JSON.stringify({ detail: 'Forbidden' })
      );
    });
  });
});
