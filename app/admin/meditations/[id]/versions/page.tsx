import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import VersionHistory from './VersionHistory';

export default async function MeditationVersionsPage({
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

  // Fetch the current meditation
  const { data: meditation, error: meditationError } = await adminClient
    .from('meditations')
    .select('*')
    .eq('id', id)
    .single();

  if (meditationError || !meditation) {
    redirect('/admin/meditations');
  }

  // Fetch all versions for this meditation
  const { data: versions, error: versionsError } = await adminClient
    .from('meditation_versions')
    .select('*')
    .eq('meditation_id', id)
    .order('version_number', { ascending: false });

  if (versionsError) {
    console.error('Error fetching versions:', versionsError);
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <nav className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/admin/meditations"
                className="text-sm text-neutral-400 hover:text-white"
              >
                ← Back to Meditations
              </a>
            </div>
            <h1 className="text-xl font-bold text-white">Version History</h1>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">{meditation.title}</h2>
          <p className="mt-2 text-neutral-400">
            View and restore previous versions of this meditation
          </p>
        </div>

        {/* Current Version */}
        <div className="mb-6 rounded-lg border border-primary/50 bg-primary/5 p-6">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">Current Version</h3>
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
              LIVE
            </span>
          </div>
          <CurrentVersionCard meditation={meditation} />
        </div>

        {/* Version History */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">
            Previous Versions ({versions?.length || 0})
          </h3>
          {versions && versions.length > 0 ? (
            <VersionHistory meditationId={id} versions={versions} />
          ) : (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-12 text-center">
              <p className="text-neutral-400">No previous versions available.</p>
              <p className="mt-2 text-sm text-neutral-500">
                Previous versions will appear here when you redo this meditation.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CurrentVersionCard({ meditation }: { meditation: any }) {
  const scriptMetadata = meditation.techniques || {};
  const scriptStyle = scriptMetadata.scriptStyle || 'energizing';
  const wordCount = meditation.script_text.split(/\s+/).filter(Boolean).length;
  const duration = meditation.audio_duration_seconds
    ? `${Math.floor(meditation.audio_duration_seconds / 60)}:${(meditation.audio_duration_seconds % 60).toString().padStart(2, '0')}`
    : `~${Math.round(wordCount / 145)} min`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <span className="text-neutral-400">Mode:</span>{' '}
          <ModeBadge mode={scriptStyle} />
        </div>
        <div>
          <span className="text-neutral-400">Duration:</span>{' '}
          <span className="text-white">{duration}</span>
        </div>
        <div>
          <span className="text-neutral-400">Words:</span>{' '}
          <span className="text-white">{wordCount.toLocaleString()}</span>
        </div>
        {scriptMetadata.version && (
          <div>
            <span className="text-neutral-400">Version:</span>{' '}
            <span className="text-white">v{scriptMetadata.version}</span>
          </div>
        )}
      </div>

      {meditation.audio_url && (
        <div className="mt-4 border-t border-neutral-700 pt-4">
          <audio controls className="w-full" src={meditation.audio_url} preload="metadata">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      <div className="flex gap-2">
        <a
          href={`/admin/script/${meditation.id}`}
          className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          View Script
        </a>
      </div>
    </div>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  const styles = {
    energizing: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
    calming: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  } as const;

  const labels = {
    energizing: '⚡ Energizing',
    calming: '🌊 Calming',
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[mode as keyof typeof styles] || 'bg-neutral-700 text-neutral-300'}`}
    >
      {labels[mode as keyof typeof labels] || mode}
    </span>
  );
}
