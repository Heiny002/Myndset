import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import GeneratePlanButton from './GeneratePlanButton';

export default async function QuestionnaireDetailPage({
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

  // Fetch questionnaire (use admin client to bypass RLS)
  const { data: questionnaire, error } = await adminClient
    .from('questionnaire_responses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !questionnaire) {
    redirect('/admin');
  }

  // Check if plan already exists (use admin client to bypass RLS)
  const { data: existingPlan } = await adminClient
    .from('meditation_plans')
    .select('*')
    .eq('questionnaire_response_id', id)
    .single();

  const responses = questionnaire.responses as Record<string, any>;

  return (
    <div className="min-h-screen bg-neutral-950">
      <nav className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/admin"
                className="text-sm text-neutral-400 hover:text-white"
              >
                ← Back to Dashboard
              </a>
            </div>
            <h1 className="text-xl font-bold text-white">Questionnaire Review</h1>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Questionnaire #{id.slice(0, 8)}
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                Submitted {new Date(questionnaire.created_at).toLocaleString()} • Tier{' '}
                {questionnaire.tier || 1}
              </p>
            </div>
            {existingPlan ? (
              <a
                href={`/admin/plan/${existingPlan.id}`}
                className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
              >
                View Existing Plan
              </a>
            ) : (
              <GeneratePlanButton questionnaireId={id} />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <ResponseSection title="Primary Goal" value={responses.primaryGoal} />
          <ResponseSection
            title="Current Mental Challenge"
            value={responses.currentChallenge}
          />
          <ResponseSection
            title="Session Length Preference"
            value={responses.sessionLength}
          />
          <ResponseSection
            title="Experience Level"
            value={responses.experienceLevel}
          />
          <ResponseSection
            title="Skepticism Level"
            value={`${responses.skepticismLevel}/5`}
            description={getSkepticismDescription(responses.skepticismLevel)}
          />
          <ResponseSection
            title="Performance Context"
            value={responses.performanceContext}
          />
          <ResponseSection
            title="Preferred Meditation Time"
            value={responses.preferredTime}
          />
          {responses.specificOutcome && (
            <ResponseSection
              title="Specific Outcome Desired"
              value={responses.specificOutcome}
              highlight
            />
          )}
        </div>

        {/* Additional Tier 2/3 Responses */}
        {questionnaire.tier > 1 && (
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Extended Questionnaire (Tier {questionnaire.tier})
            </h3>
            <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <p className="text-sm text-neutral-400">
                Additional responses from Tier {questionnaire.tier} questionnaire would
                appear here.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ResponseSection({
  title,
  value,
  description,
  highlight = false,
}: {
  title: string;
  value: string;
  description?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        highlight
          ? 'border-primary bg-primary/5'
          : 'border-neutral-800 bg-neutral-900'
      }`}
    >
      <h3 className="mb-2 text-sm font-medium text-neutral-400">{title}</h3>
      <p className={`text-lg ${highlight ? 'text-primary' : 'text-white'}`}>{value}</p>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
    </div>
  );
}

function getSkepticismDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: 'Very open to meditation practices',
    2: 'Somewhat open, willing to try',
    3: 'Neutral, need some convincing',
    4: 'Skeptical, need strong evidence',
    5: 'Very skeptical, only evidence-based approaches',
  };
  return descriptions[level] || '';
}
