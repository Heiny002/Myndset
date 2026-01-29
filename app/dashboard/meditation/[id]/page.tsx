import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import MeditationDetailClient from './MeditationDetailClient';

export default async function MeditationDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signup?redirect=/dashboard');
  }

  // Check if user is admin - admins can view any meditation
  const userIsAdmin = await isAdmin();

  // Fetch the meditation - admins can see all, users only their own
  let meditation;
  let error;

  if (userIsAdmin) {
    // Admin: use admin client to bypass RLS and see any meditation
    const adminClient = createAdminClient();
    const result = await adminClient
      .from('meditations')
      .select('*')
      .eq('id', params.id)
      .single();
    meditation = result.data;
    error = result.error;
  } else {
    // Regular user: only see their own meditations
    const result = await supabase
      .from('meditations')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();
    meditation = result.data;
    error = result.error;
  }

  if (error || !meditation) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-neutral-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Meditation Not Found</h1>
          <p className="text-neutral-400 mb-6">
            This meditation doesn't exist or you don't have access to it.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-neutral-950 font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Library
          </Link>
          <Link href="/" className="text-xl font-bold text-white">
            Myndset
          </Link>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </nav>

      <MeditationDetailClient meditation={meditation} isAdmin={userIsAdmin} />
    </div>
  );
}
