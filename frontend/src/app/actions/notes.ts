'use server';

import { revalidatePath } from 'next/cache';
import { getServerApiClient } from '@/lib/api';

export async function createNoteAction(payload: {
  title?: string;
  content?: string;
  category_id?: string;
}) {
  const client = await getServerApiClient();
  const { data, error } = await client.POST('/api/notes/', {
    body: {
      title: payload.title,
      content: payload.content || '',
      category_id: payload.category_id || null,
    },
  });

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  revalidatePath('/');
  return data;
}

export async function updateNoteAction(
  id: string,
  payload: {
    title?: string;
    content?: string;
    category_id?: string | null;
  }
) {
  const client = await getServerApiClient();
  const { data, error } = await client.PATCH('/api/notes/{id}/', {
    params: { path: { id } },
    body: {
      title: payload.title,
      content: payload.content,
      category_id: payload.category_id,
    },
  });

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  revalidatePath('/');
  return data;
}

export async function deleteNoteAction(id: string) {
  const client = await getServerApiClient();
  const { error } = await client.DELETE('/api/notes/{id}/', {
    params: { path: { id } },
  });

  if (error) {
    throw new Error(JSON.stringify(error));
  }

  revalidatePath('/');
}
