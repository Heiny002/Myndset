'use client';

import { useState } from 'react';

type TabType = 'questionnaires' | 'plans';

interface AdminDashboardClientProps {
  pendingQuestionnaires: any[];
  pendingPlans: any[];
  allPlans: any[];
}

export default function AdminDashboardClient({
  pendingQuestionnaires,
  pendingPlans,
  allPlans,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('questionnaires');

  // Filter plans by status
  const approvedPlans = allPlans.filter((p) => p.status === 'approved');
  const completedPlans = allPlans.filter((p) => {
    // Plans with audio generated (check if meditation exists with audio_url)
    return p.meditation_id && p.audio_url;
  });

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-800">
        <nav className="-mb-px flex gap-8">
          <TabLink
            onClick={() => setActiveTab('questionnaires')}
            active={activeTab === 'questionnaires'}
          >
            Questionnaires
            {pendingQuestionnaires.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-neutral-950">
                {pendingQuestionnaires.length}
              </span>
            )}
          </TabLink>
          <TabLink
            onClick={() => setActiveTab('plans')}
            active={activeTab === 'plans'}
          >
            Meditation Plans
            {allPlans.length > 0 && (
              <span className="ml-2 rounded-full bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-300">
                {allPlans.length}
              </span>
            )}
          </TabLink>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'questionnaires' && (
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
      )}

      {activeTab === 'plans' && (
        <>
          {/* Pending Plans Section */}
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Pending Approval ({pendingPlans.length})
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

          {/* Approved Plans Section */}
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Approved Plans ({approvedPlans.length})
            </h2>
            {approvedPlans.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
                <p className="text-neutral-400">No approved meditation plans</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} showAudioStatus />
                ))}
              </div>
            )}
          </section>

          {/* Completed Plans (with Audio) Section */}
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Completed (With Audio) ({completedPlans.length})
            </h2>
            {completedPlans.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
                <p className="text-neutral-400">
                  No completed meditation plans with audio
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} showAudioStatus />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

function TabLink({
  onClick,
  active = false,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center border-b-2 py-4 text-sm font-medium ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
      }`}
    >
      {children}
    </button>
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

function PlanCard({
  plan,
  showAudioStatus = false,
}: {
  plan: any;
  showAudioStatus?: boolean;
}) {
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
            <StatusBadge status={plan.status} />
            {showAudioStatus && plan.audio_url && (
              <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                ✓ Audio Generated
              </span>
            )}
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
            Generated {timeAgo} • {plan.plan_data?.sessionStructure?.totalMinutes}{' '}
            min
          </p>
        </div>
        <div className="ml-4 flex flex-col gap-2">
          <a
            href={`/admin/plan/${plan.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-neutral-950 hover:bg-primary/90"
          >
            {plan.status === 'pending_approval' ? 'Review Plan' : 'View Plan'}
          </a>
          {showAudioStatus && plan.meditation_id && (
            <a
              href={`/admin/script/${plan.meditation_id}`}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-neutral-700"
            >
              View Script & Audio
            </a>
          )}
        </div>
      </div>
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

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
