import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import ScriptActions from './ScriptActions';
import ScriptEditor from './ScriptEditor';

export default async function ScriptReviewPage({
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

  // Fetch script (use admin client to bypass RLS)
  const { data: script, error } = await adminClient
    .from('meditations')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !script) {
    redirect('/admin');
  }

  // Fetch associated plan (use admin client to bypass RLS)
  const { data: plan } = await adminClient
    .from('meditation_plans')
    .select('*')
    .eq('id', script.meditation_plan_id)
    .single();

  // Extract metadata from techniques JSONB field (we use it for metadata storage)
  const scriptMetadata = (script.techniques as any) || {};
  const wordCount = script.script_text.split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-neutral-950">
      <nav className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-neutral-400 hover:text-white">
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-xl font-bold text-white">Script Review</h1>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Script Header */}
        <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{script.title}</h2>
                <StatusBadge status={scriptMetadata?.status || 'pending_approval'} />
              </div>
              <p className="text-sm text-neutral-400">
                Generated {new Date(script.created_at).toLocaleString()}
              </p>
              {plan && (
                <Link
                  href={`/admin/plan/${plan.id}`}
                  className="mt-2 inline-block text-sm text-primary hover:underline"
                >
                  View Meditation Plan →
                </Link>
              )}
            </div>
            <ScriptActions
              scriptId={id}
              currentStatus={scriptMetadata?.status || 'pending_approval'}
              hasAudio={!!script.audio_url}
            />
          </div>
        </div>

        {/* Script Metrics */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <MetricCard title="Word Count" value={wordCount.toLocaleString()} />
          <MetricCard
            title="Estimated Duration"
            value={
              script.audio_duration_seconds
                ? `${Math.floor(script.audio_duration_seconds / 60)}:${(script.audio_duration_seconds % 60).toString().padStart(2, '0')}`
                : `${Math.round(wordCount / 145)} min`
            }
          />
          <MetricCard
            title="Version"
            value={`v${scriptMetadata?.version || 1}`}
          />
        </div>

        {/* Audio Player */}
        {script.audio_url && (
          <div className="mb-6 rounded-lg border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Generated Audio
            </h3>
            <audio
              controls
              className="w-full"
              src={script.audio_url}
              preload="metadata"
            >
              Your browser does not support the audio element.
            </audio>
            <div className="mt-3 flex gap-4 text-sm text-neutral-400">
              {scriptMetadata?.audio_voice_name && (
                <span>Voice: {scriptMetadata.audio_voice_name}</span>
              )}
              {scriptMetadata?.audio_character_count && (
                <>
                  <span>•</span>
                  <span>
                    {scriptMetadata.audio_character_count.toLocaleString()}{' '}
                    characters
                  </span>
                </>
              )}
              {scriptMetadata?.audio_cost_cents && (
                <>
                  <span>•</span>
                  <span>
                    Cost: ${(scriptMetadata.audio_cost_cents / 100).toFixed(2)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Script Editor */}
        <ScriptEditor
          scriptId={id}
          initialScript={script.script_text}
          isApproved={scriptMetadata?.status === 'approved'}
        />

        {/* Regeneration Feedback */}
        {scriptMetadata?.regeneration_feedback && (
          <div className="mt-6 rounded-lg border border-orange-500/20 bg-orange-500/5 p-4">
            <h3 className="mb-2 text-sm font-medium text-orange-500">
              Previous Regeneration Feedback
            </h3>
            <p className="text-sm text-neutral-300">
              {scriptMetadata.regeneration_feedback}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending_approval: 'bg-yellow-500/10 text-yellow-500',
    approved: 'bg-green-500/10 text-green-500',
    generating_audio: 'bg-blue-500/10 text-blue-500',
    completed: 'bg-primary/10 text-primary',
  } as const;

  const labels = {
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    generating_audio: 'Generating Audio',
    completed: 'Completed',
  } as const;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-neutral-700 text-neutral-300'}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-sm text-neutral-400">{title}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
