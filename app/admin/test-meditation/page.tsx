import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import TestMeditationClient from './TestMeditationClient';

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Create Test Meditation | Admin | Myndset',
  description: 'Create test meditations with full questionnaire access',
};

export default async function AdminTestMeditationPage() {
  // Verify admin access
  await requireAdmin();

  // Get the current user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signup');
  }

  return <TestMeditationClient userId={user.id} userEmail={user.email || ''} />;
}
