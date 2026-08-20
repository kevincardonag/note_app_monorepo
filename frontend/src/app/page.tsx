import { redirect } from 'next/navigation';
import { getServerApiClient } from '@/lib/api';
import { DashboardClient } from '@/components/DashboardClient';
import type { NoteItem } from '@/components/NoteCard';
import type { CategoryItem } from '@/components/NoteEditorModal';

export const metadata = {
  title: 'Dashboard — Note App',
  description: 'Organize and view all your notes',
};

export default async function HomePage() {
  const client = await getServerApiClient();

  // Fetch categories, notes, and user info concurrently
  const [categoriesRes, notesRes, meRes] = await Promise.all([
    client.GET('/api/categories/'),
    client.GET('/api/notes/'),
    client.GET('/api/auth/me/'),
  ]);

  // If any critical request returns a 401, the tokens are invalid — redirect to login
  if (categoriesRes.error || notesRes.error || meRes.error) {
    redirect('/login');
  }

  const categories: CategoryItem[] =
    (categoriesRes.data as unknown as CategoryItem[]) || [];
  const notes: NoteItem[] = (notesRes.data as unknown as NoteItem[]) || [];
  const userEmail = meRes.data?.email;

  return (
    <DashboardClient
      initialNotes={notes}
      categories={categories}
      userEmail={userEmail}
    />
  );
}
