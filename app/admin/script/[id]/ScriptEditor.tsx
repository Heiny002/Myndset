'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScriptEditor({
  scriptId,
  initialScript,
  isApproved,
}: {
  scriptId: string;
  initialScript: string;
  isApproved: boolean;
}) {
  const [script, setScript] = useState(initialScript);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = Math.round((wordCount / 145) * 10) / 10;

  async function handleSave() {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/update-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scriptId, scriptText: script }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save script');
      }

      setIsEditing(false);
      if (isApproved) {
        // Status changed - refresh the page to reflect new state
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setScript(initialScript);
    setIsEditing(false);
    setError(null);
  }

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Meditation Script</h3>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
            >
              Edit Script
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {isEditing ? (
        <div>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            className="mb-3 min-h-[600px] w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 font-mono text-sm leading-relaxed text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter meditation script..."
          />
          <div className="flex gap-4 text-sm text-neutral-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>~{estimatedMinutes} min estimated</span>
          </div>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none">
          <div className="rounded-lg bg-neutral-950 p-6">
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-neutral-200">
              {script}
            </pre>
          </div>
        </div>
      )}

      {isApproved && !isEditing && (
        <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
          <p className="text-sm text-yellow-500">
            Script is approved. Saving changes will set it back to pending approval and clear audio.
          </p>
        </div>
      )}
    </div>
  );
}
