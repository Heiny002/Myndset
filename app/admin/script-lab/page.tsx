import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import ScriptLabClient from './ScriptLabClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ScriptLabPage() {
  const admin = await isAdmin();
  if (!admin) {
    redirect('/dashboard');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return <ScriptLabClient userId={user.id} />;
}
