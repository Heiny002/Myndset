'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScriptActions({
  scriptId,
  currentStatus,
  hasAudio,
}: {
  scriptId: string;
  currentStatus: string;
  hasAudio: boolean;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [voiceType, setVoiceType] = useState<string>('professional');
  const router = useRouter();

  async function handleApprove() {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/approve-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scriptId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve script');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleRegenerate() {
    if (!feedback.trim()) {
      setError('Please provide feedback for regeneration');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/regenerate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scriptId, feedback }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate script');
      }

      router.refresh();
      setShowFeedback(false);
      setFeedback('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleGenerateAudio() {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/generate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scriptId, voiceType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }

  if (currentStatus === 'approved') {
    if (hasAudio) {
      return (
        <div className="text-sm text-green-500">
          ✓ Audio generated - Meditation complete
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end gap-2">
        <div className="text-sm text-green-500 mb-2">
          ✓ Script approved
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <select
              value={voiceType}
              onChange={(e) => setVoiceType(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="professional">Professional (Adam)</option>
              <option value="calm">Calm (Sarah)</option>
              <option value="energizing">Energizing (Antoni)</option>
            </select>
            <button
              onClick={handleGenerateAudio}
              disabled={isProcessing}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? 'Generating Audio...' : 'Generate Audio'}
            </button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Approve Script'}
        </button>
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          disabled={isProcessing}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Regenerate
        </button>
      </div>

      {showFeedback && (
        <div className="mt-2 w-full max-w-md">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide feedback (e.g., 'Too formal', 'Add more pauses', 'Simplify language')"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setShowFeedback(false);
                setFeedback('');
              }}
              className="rounded-lg bg-neutral-700 px-3 py-1.5 text-sm text-white hover:bg-neutral-600"
            >
              Cancel
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isProcessing || !feedback.trim()}
              className="rounded-lg bg-orange-600 px-3 py-1.5 text-sm text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? 'Regenerating...' : 'Submit & Regenerate'}
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
