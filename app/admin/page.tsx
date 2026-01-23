import { redirect } from 'next/navigation';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';

// Force dynamic rendering - don't cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/dashboard');
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Fetch all questionnaire responses
  const { data: questionnaires, error: questionnairesError } = await supabase
    .from('questionnaire_responses')
    .select('*')
    .order('created_at', { ascending: false });

  if (questionnairesError) {
    console.error('Error fetching questionnaires:', questionnairesError);
  }

  // Fetch all meditation plans
  const { data: plans, error: plansError } = await supabase
    .from('meditation_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (plansError) {
    console.error('Error fetching plans:', plansError);
  }

  // Fetch all meditations (completed)
  const { data: meditations } = await supabase
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
    (q) => !plans?.some((p) => p.questionnaire_response_id === q.id)
  ) || [];

  const pendingPlans = plans?.filter((p) => p.status === 'pending_approval') || [];

  return (
    <div className="min-h-screen bg-neutral-950">
      <nav className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-white">Myndset Admin</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">Admin Dashboard</span>
              <a
                href="/auth/signout"
                className="text-sm text-neutral-400 hover:text-white"
              >
                Sign Out
              </a>
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
            value={plans?.length || 0}
            subtitle="Generated plans"
          />
          <StatCard
            title="Total Meditations"
            value={meditations?.length || 0}
            subtitle="Delivered content"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-neutral-800">
          <nav className="-mb-px flex gap-8">
            <TabLink href="#questionnaires" active>
              Questionnaires
              {pendingQuestionnaires.length > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-neutral-950">
                  {pendingQuestionnaires.length}
                </span>
              )}
            </TabLink>
            <TabLink href="#plans">
              Meditation Plans
              {pendingPlans.length > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-neutral-950">
                  {pendingPlans.length}
                </span>
              )}
            </TabLink>
          </nav>
        </div>

        {/* Pending Questionnaires Section */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Pending Questionnaires ({pendingQuestionnaires.length})
          </h2>
          {pendingQuestionnaires.length === 0 ? (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
              <p className="text-neutral-400">No pending questionnaires</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQuestionnaires.map((questionnaire) => (
                <QuestionnaireCard
                  key={questionnaire.id}
                  questionnaire={questionnaire}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pending Plans Section */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Pending Meditation Plans ({pendingPlans.length})
          </h2>
          {pendingPlans.length === 0 ? (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
              <p className="text-neutral-400">No pending meditation plans</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </section>
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

function TabLink({
  href,
  active = false,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={`flex items-center border-b-2 py-4 text-sm font-medium ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
      }`}
    >
      {children}
    </a>
  );
}

function QuestionnaireCard({ questionnaire }: { questionnaire: any }) {
  const createdAt = new Date(questionnaire.created_at);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="font-semibold text-white">
              {questionnaire.responses?.primaryGoal || 'New Questionnaire'}
            </h3>
            <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
              Pending
            </span>
          </div>
          <div className="grid gap-2 text-sm">
            <div className="flex gap-2">
              <span className="text-neutral-500">Goal:</span>
              <span className="text-neutral-300">
                {questionnaire.responses?.primaryGoal}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-500">Challenge:</span>
              <span className="text-neutral-300">
                {questionnaire.responses?.currentChallenge}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-500">Duration:</span>
              <span className="text-neutral-300">
                {questionnaire.responses?.sessionLength}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-neutral-500">Context:</span>
              <span className="text-neutral-300">
                {questionnaire.responses?.performanceContext}
              </span>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Submitted {timeAgo} • Tier {questionnaire.tier || 1}
          </p>
        </div>
        <div className="ml-4">
          <a
            href={`/admin/questionnaire/${questionnaire.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-primary/90"
          >
            Generate Plan
          </a>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: any }) {
  const createdAt = new Date(plan.created_at);
  const timeAgo = getTimeAgo(createdAt);

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="font-semibold text-white">
              Meditation Plan #{plan.id?.slice(0, 8)}
            </h3>
            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
              Pending Approval
            </span>
          </div>
          <p className="mb-3 text-sm text-neutral-300">
            {plan.plan_data?.overallRationale || 'No rationale provided'}
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.plan_data?.components?.map((comp: any, idx: number) => (
              <span
                key={idx}
                className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-300"
              >
                {comp.componentName}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Generated {timeAgo} • {plan.plan_data?.sessionStructure?.totalMinutes} min
          </p>
        </div>
        <div className="ml-4 flex flex-col gap-2">
          <a
            href={`/admin/plan/${plan.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-neutral-950 hover:bg-primary/90"
          >
            Review Plan
          </a>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
