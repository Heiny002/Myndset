'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanActions({
  planId,
  currentStatus,
  hasScript = false,
}: {
  planId: string;
  currentStatus: string;
  hasScript?: boolean;
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [voiceType, setVoiceType] = useState<string>('default');
  const router = useRouter();

  async function handleApprove() {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/approve-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve plan');
      }

      setSuccess('Plan approved successfully!');
      // Only refresh after a delay to show success message
      setTimeout(() => router.refresh(), 500);
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
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/regenerate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, feedback }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate plan');
      }

      setSuccess('Plan regenerated successfully!');
      setShowFeedback(false);
      setFeedback('');
      // Only refresh after a delay to show success message
      setTimeout(() => router.refresh(), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleGenerateScript() {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/generate-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, voiceType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      // Redirect to script review page
      router.push(`/admin/script/${data.scriptId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  }

  if (currentStatus === 'approved') {
    if (hasScript) {
      return (
        <div className="flex flex-col items-end gap-4">
          <div className="text-sm text-green-500">
            ✓ Plan approved - Script generated
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              disabled={isProcessing}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Regenerate Plan
            </button>
            <p className="text-xs text-neutral-500">This will regenerate the plan. You&apos;ll need to regenerate the script and audio afterwards.</p>
          </div>

          {showFeedback && (
            <div className="w-full max-w-md">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback for regeneration (e.g., 'Too many components', 'Wrong messaging tone')"
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
          {success && <p className="text-sm text-green-500">{success}</p>}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <select
            value={voiceType}
            onChange={(e) => setVoiceType(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="default">Coach (Default)</option>
            <option value="sarge">Sarge</option>
            <option value="professional">Professional (Adam)</option>
            <option value="calm">Calm (Sarah)</option>
            <option value="energizing">Energizing (Antoni)</option>
          </select>
          <button
            onClick={handleGenerateScript}
            disabled={isProcessing}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-neutral-950 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? 'Generating Script...' : 'Generate Meditation Script'}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {success && <p className="text-sm text-green-500">{success}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Approve Plan'}
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
            placeholder="Provide feedback for regeneration (e.g., 'Too many components', 'Wrong messaging tone')"
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
