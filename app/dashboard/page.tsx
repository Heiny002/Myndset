import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import DashboardClient from './DashboardClient';
import CreateMeditationButton from './CreateMeditationButton';
import SuccessBanner from '@/components/SuccessBanner';
import UsageStats from '@/components/UsageStats';
import { getUserUsage, getUserTier } from '@/lib/usage/tracking';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signup?redirect=/dashboard');
  }

  // Redirect admins to admin dashboard
  const userIsAdmin = await isAdmin();
  if (userIsAdmin) {
    redirect('/admin');
  }

  // Get all user's meditations
  const { data: meditations } = await supabase
    .from('meditations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Get pending plans
  const { data: pendingPlans } = await supabase
    .from('meditation_plans')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['pending_approval', 'approved'])
    .order('created_at', { ascending: false })
    .limit(1);

  // Get questionnaires without plans (submitted but not processed yet)
  const { data: allQuestionnaires } = await supabase
    .from('questionnaire_responses')
    .select('id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: allPlans } = await supabase
    .from('meditation_plans')
    .select('questionnaire_response_id')
    .eq('user_id', user.id);

  const planQuestionnaireIds = new Set(allPlans?.map((p) => p.questionnaire_response_id) || []);
  const pendingQuestionnaires = allQuestionnaires?.filter(
    (q) => !planQuestionnaireIds.has(q.id)
  ) || [];

  const hasPendingPlan = pendingPlans && pendingPlans.length > 0;
  const hasPendingQuestionnaire = pendingQuestionnaires.length > 0;
  const hasMeditations = meditations && meditations.length > 0;

  // Get user usage statistics
  const usage = await getUserUsage(user.id);
  const tier = await getUserTier(user.id);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Success Banner */}
      <Suspense fallback={null}>
        <SuccessBanner />
      </Suspense>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Myndset
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-sm text-neutral-400 transition-colors hover:text-white"
            >
              Settings
            </Link>
            <span className="hidden text-sm text-neutral-400 sm:block">
              {user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-sm text-neutral-400 transition-colors hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Your Meditation Library
          </h1>
          <p className="text-neutral-400">
            Performance-optimized meditations crafted for you
          </p>
        </div>

        {/* Action Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* New Meditation */}
          {usage && (
            <CreateMeditationButton usage={usage} tier={tier} />
          )}

          {/* Pending Questionnaire Status */}
          {hasPendingQuestionnaire && !hasPendingPlan && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                  <svg
                    className="h-6 w-6 animate-pulse text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Meditation In Progress
                  </h3>
                  <p className="text-sm text-neutral-400">
                    Questionnaire submitted, awaiting admin review
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pending Plan Status */}
          {hasPendingPlan && (
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20">
                  <svg
                    className="h-6 w-6 animate-pulse text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Meditation In Progress
                  </h3>
                  <p className="text-sm text-neutral-400">
                    {pendingPlans[0].status === 'pending_approval'
                      ? 'Plan awaiting approval'
                      : 'Being prepared'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Meditation Library (2/3 width) */}
          <div className="lg:col-span-2">
            {hasMeditations ? (
              <DashboardClient meditations={meditations} />
            ) : (
          // Empty State
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-4 py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800">
              <svg
                className="h-8 w-8 text-neutral-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              No meditations yet
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-neutral-400">
              Take our quick assessment and we'll create a personalized
              meditation designed to sharpen your competitive edge.
            </p>
            <Link
              href="/questionnaire"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-neutral-950 transition-colors hover:bg-primary/90"
            >
              Create Your First Meditation
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>
            )}
          </div>

          {/* Right Column - Usage Stats (1/3 width) */}
          {usage && (
            <div className="lg:col-span-1">
              <UsageStats usage={usage} tier={tier} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
