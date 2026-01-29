import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import AdminDashboardClient from './AdminDashboardClient';

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/dashboard');
  }

  const adminClient = createAdminClient();

  // Fetch all questionnaire responses (use admin client to bypass RLS)
  const { data: questionnaires, error: questionnairesError } = await adminClient
    .from('questionnaire_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (questionnairesError) {
    console.error('Error fetching questionnaires:', questionnairesError);
  }

  // Fetch all meditation plans with meditation and questionnaire data (use admin client to bypass RLS)
  const { data: plans, error: plansError } = await adminClient
    .from('meditation_plans')
    .select(`
      *,
      meditations (
        id,
        audio_url,
        audio_duration_seconds,
        script_text
      ),
      questionnaire_responses:questionnaire_response_id (
        title
      )
    `)
    .order('created_at', { ascending: false });

  if (plansError) {
    console.error('Error fetching plans:', plansError);
  }

  // Flatten meditation data into plans for easier access
  const plansWithAudio = plans?.map((plan: any) => ({
    ...plan,
    meditation_id: plan.meditations?.[0]?.id || null,
    audio_url: plan.meditations?.[0]?.audio_url || null,
    audio_duration_seconds: plan.meditations?.[0]?.audio_duration_seconds || null,
    has_script: !!plan.meditations?.[0]?.script_text,
    questionnaire_title: plan.questionnaire_responses?.title || null,
  })) || [];

  // Fetch all meditations (use admin client to bypass RLS)
  const { data: meditations } = await adminClient
    .from('meditations')
    .select('id, user_id, created_at')
    .order('created_at', { ascending: false });

  // Fetch user count from auth
  const { data: allUsers } = await adminClient.auth.admin.listUsers();
  const totalUsers = allUsers?.users?.length || 0;

  // Get unique users who have submitted questionnaires
  const uniqueQuestionnaireUsers = new Set(questionnaires?.map((q) => q.user_id) || []);
  const activeUsers = uniqueQuestionnaireUsers.size;

  // Calculate completion rate (questionnaires that have completed meditations)
  const meditationUserIds = new Set(meditations?.map((m) => m.user_id) || []);
  const completedQuestionnaires = questionnaires?.filter((q) =>
    meditationUserIds.has(q.user_id)
  ) || [];
  const completionRate = questionnaires && questionnaires.length > 0
    ? Math.round((completedQuestionnaires.length / questionnaires.length) * 100)
    : 0;

  // Count pending items
  const pendingQuestionnaires = questionnaires?.filter(
    (q) => !plansWithAudio?.some((p) => p.questionnaire_response_id === q.id)
  ) || [];

  const pendingPlans = plansWithAudio?.filter((p) => p.status === 'pending_approval') || [];

  return (
    <div className="min-h-screen bg-neutral-950">
      <nav className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-white">Myndset Admin</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/test-meditation"
                className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
              >
                Create Test Meditation
              </Link>
              <Link
                href="/admin/meditations"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-primary/90"
              >
                Manage Meditations
              </Link>
              <span className="text-sm text-neutral-400">Admin Dashboard</span>
              <Link
                href="/auth/signout"
                className="text-sm text-neutral-400 hover:text-white"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Questionnaires"
            value={pendingQuestionnaires.length}
            subtitle="Need plan generation"
            highlight={pendingQuestionnaires.length > 0}
          />
          <StatCard
            title="Pending Plans"
            value={pendingPlans.length}
            subtitle="Awaiting approval"
            highlight={pendingPlans.length > 0}
          />
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle={`${activeUsers} active`}
          />
          <StatCard
            title="Completion Rate"
            value={`${completionRate}%`}
            subtitle={`${meditations?.length || 0} completed`}
          />
        </div>

        {/* Secondary Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Questionnaires"
            value={questionnaires?.length || 0}
            subtitle="All submissions"
          />
          <StatCard
            title="Total Plans"
            value={plansWithAudio?.length || 0}
            subtitle="Generated plans"
          />
          <StatCard
            title="Total Meditations"
            value={meditations?.length || 0}
            subtitle="Delivered content"
          />
        </div>

        {/* Tabs and Content - Client Component */}
        <AdminDashboardClient
          pendingQuestionnaires={pendingQuestionnaires}
          pendingPlans={pendingPlans}
          allPlans={plansWithAudio}
        />
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  highlight = false,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        highlight
          ? 'border-primary bg-primary/10'
          : 'border-neutral-800 bg-neutral-900'
      }`}
    >
      <p className="text-sm font-medium text-neutral-400">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${highlight ? 'text-primary' : 'text-white'}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
    </div>
  );
}

