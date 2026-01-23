import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import PlanActions from './PlanActions';

export default async function PlanReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/dashboard');
  }

  const adminClient = createAdminClient();

  // Fetch plan (use admin client to bypass RLS)
  const { data: plan, error } = await adminClient
    .from('meditation_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !plan) {
    redirect('/admin');
  }

  // Fetch associated questionnaire (use admin client to bypass RLS)
  const { data: questionnaire } = await adminClient
    .from('questionnaire_responses')
    .select('*')
    .eq('id', plan.questionnaire_response_id)
    .single();

  // Check if script exists for this plan (use admin client to bypass RLS)
  const { data: existingScript } = await adminClient
    .from('meditations')
    .select('id')
    .eq('meditation_plan_id', id)
    .single();

  const planData = plan.plan_data as any;

  return (
    <div className="min-h-screen bg-neutral-950">
      <nav className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="text-sm text-neutral-400 hover:text-white"
              >
                ← Back to Dashboard
              </a>
            </div>
            <h1 className="text-xl font-bold text-white">Meditation Plan Review</h1>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Plan Header */}
        <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">
                  Meditation Plan #{id.slice(0, 8)}
                </h2>
                <StatusBadge status={plan.status} />
              </div>
              <p className="text-sm text-neutral-400">
                Generated {new Date(plan.created_at).toLocaleString()}
              </p>
              {questionnaire && (
                <a
                  href={`/admin/questionnaire/${questionnaire.id}`}
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  View Original Questionnaire →
                </a>
              )}
              {existingScript && (
                <a
                  href={`/admin/script/${existingScript.id}`}
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  View Generated Script →
                </a>
              )}
            </div>
            <PlanActions
              planId={id}
              currentStatus={plan.status}
              hasScript={!!existingScript}
            />
          </div>
        </div>

        {/* Overall Rationale */}
        <div className="mb-6 rounded-lg border border-primary bg-primary/5 p-6">
          <h3 className="mb-2 text-sm font-medium text-neutral-400">
            Overall Rationale
          </h3>
          <p className="text-lg text-white">{planData.overallRationale}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Session Structure */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Session Structure
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Duration:</span>
                <span className="font-medium text-white">
                  {planData.sessionStructure.duration} (
                  {planData.sessionStructure.totalMinutes} min)
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {planData.sessionStructure.phases.map((phase: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-md border border-neutral-800 bg-neutral-950 p-3"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium text-white">{phase.name}</span>
                      <span className="text-sm text-neutral-400">
                        {phase.durationMinutes} min
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {phase.components.map((comp: string, compIdx: number) => (
                        <span
                          key={compIdx}
                          className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Messaging Framework */}
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Messaging Framework
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-neutral-400">Audience Type:</span>
                <p className="mt-1 font-medium text-white">
                  {planData.messagingFramework.audienceType}
                </p>
              </div>
              <div>
                <span className="text-sm text-neutral-400">Key Values:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {planData.messagingFramework.keyValues.map(
                    (value: string, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                      >
                        {value}
                      </span>
                    )
                  )}
                </div>
              </div>
              <div>
                <span className="text-sm text-neutral-400">Approach:</span>
                <p className="mt-1 text-sm text-neutral-300">
                  {planData.messagingFramework.approachDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Components */}
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Selected Components ({planData.components.length})
          </h3>
          <div className="space-y-4">
            {planData.components.map((component: any, idx: number) => (
              <div
                key={idx}
                className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-white">
                      {component.componentName}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-neutral-500">
                        {component.durationMinutes} min
                      </span>
                      <span className="text-xs text-neutral-500">•</span>
                      <span
                        className={`text-xs ${
                          component.evidenceLevel === 'high'
                            ? 'text-green-500'
                            : component.evidenceLevel === 'medium'
                              ? 'text-yellow-500'
                              : 'text-orange-500'
                        }`}
                      >
                        {component.evidenceLevel} evidence
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-300">{component.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending_approval: 'bg-yellow-500/10 text-yellow-500',
    approved: 'bg-green-500/10 text-green-500',
    regenerate_requested: 'bg-orange-500/10 text-orange-500',
  } as const;

  const labels = {
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    regenerate_requested: 'Regenerate Requested',
  } as const;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-neutral-700 text-neutral-300'}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}
