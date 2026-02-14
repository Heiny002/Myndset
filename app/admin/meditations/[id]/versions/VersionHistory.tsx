'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type MeditationVersion = {
  id: string;
  meditation_id: string;
  version_number: number;
  script_text: string;
  script_style: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  voice_id: string | null;
  voice_type: string | null;
  techniques: any;
  generation_cost_cents: number | null;
  is_live: boolean;
  replaced_at: string;
  created_at: string;
};

export default function VersionHistory({
  meditationId,
  versions,
}: {
  meditationId: string;
  versions: MeditationVersion[];
}) {
  return (
    <div className="space-y-4">
      {versions.map((version) => (
        <VersionCard key={version.id} version={version} />
      ))}
    </div>
  );
}

function VersionCard({ version }: { version: MeditationVersion }) {
  const [showScript, setShowScript] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const scriptStyle = version.script_style || 'energizing';
  const wordCount = version.script_text.split(/\s+/).filter(Boolean).length;
  const duration = version.audio_duration_seconds
    ? `${Math.floor(version.audio_duration_seconds / 60)}:${(version.audio_duration_seconds % 60).toString().padStart(2, '0')}`
    : `~${Math.round(wordCount / 145)} min`;

  async function handleRestore() {
    if (!confirm('Restore this version? The current version will be archived.')) {
      return;
    }

    setIsRestoring(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/restore-version', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId: version.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to restore version');
      }

      setSuccess('Version restored successfully!');
      // Delay refresh to show success message
      setTimeout(() => router.refresh(), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h4 className="text-lg font-semibold text-white">
              Version {version.version_number}
            </h4>
            <ModeBadge mode={scriptStyle} />
            {version.is_live && (
              <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-400">
            Replaced on {new Date(version.replaced_at).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {success && <p className="text-sm text-green-500">{success}</p>}
          <button
            onClick={handleRestore}
            disabled={isRestoring || version.is_live}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRestoring ? 'Restoring...' : 'Restore This Version'}
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-neutral-400">
        <span>
          <strong className="text-neutral-300">Duration:</strong> {duration}
        </span>
        <span>•</span>
        <span>
          <strong className="text-neutral-300">Words:</strong>{' '}
          {wordCount.toLocaleString()}
        </span>
        {version.voice_type && (
          <>
            <span>•</span>
            <span>
              <strong className="text-neutral-300">Voice:</strong>{' '}
              {version.voice_type}
            </span>
          </>
        )}
        {version.generation_cost_cents && (
          <>
            <span>•</span>
            <span>
              <strong className="text-neutral-300">Cost:</strong> $
              {(version.generation_cost_cents / 100).toFixed(2)}
            </span>
          </>
        )}
      </div>

      {/* Audio Player */}
      {version.audio_url && (
        <div className="mb-4 border-t border-neutral-800 pt-4">
          <p className="mb-2 text-sm font-medium text-neutral-300">Audio</p>
          <audio controls className="w-full" src={version.audio_url} preload="metadata">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Script Preview */}
      <div>
        <button
          onClick={() => setShowScript(!showScript)}
          className="text-sm text-primary hover:underline"
        >
          {showScript ? '▼ Hide Script' : '▶ View Script'}
        </button>

        {showScript && (
          <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-sm text-neutral-300">
              {version.script_text}
            </pre>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
          {error}
        </div>
      )}
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
