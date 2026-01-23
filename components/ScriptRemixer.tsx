'use client';

import { useState, useRef, useEffect } from 'react';
import UpgradeModal from './UpgradeModal';
import type { SubscriptionTier } from '@/lib/usage/tracking';

interface ScriptRemixerProps {
  meditationId: string;
  scriptText: string;
  onRemixComplete: (newScript: string, audioUrl: string | null) => void;
  onClose: () => void;
}

interface RemixUsage {
  used: number;
  limit: number;
  tier: string;
}

export default function ScriptRemixer({
  meditationId,
  scriptText,
  onRemixComplete,
  onClose,
}: ScriptRemixerProps) {
  const [selectedText, setSelectedText] = useState('');
  const [remixInstructions, setRemixInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [usage, setUsage] = useState<RemixUsage | null>(null);
  const [regenerateAudio, setRegenerateAudio] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const scriptRef = useRef<HTMLDivElement>(null);

  // Fetch current usage on mount
  useEffect(() => {
    fetch('/api/user/remix-section')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsage(data.usage);
        }
      })
      .catch((err) => console.error('Error fetching usage:', err));
  }, []);

  // Handle text selection
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length >= 20) {
      setSelectedText(text);
      setError(null);
    } else if (text && text.length > 0 && text.length < 20) {
      setError('Please select at least 20 characters (about 4-5 words)');
      setSelectedText('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedText || selectedText.length < 20) {
      setError('Please select a section of at least 20 characters');
      return;
    }

    if (!remixInstructions || remixInstructions.length < 10) {
      setError('Please provide remix instructions (at least 10 characters)');
      return;
    }

    if (usage && usage.used >= usage.limit) {
      setShowUpgradeModal(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/remix-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meditationId,
          sectionToRemix: selectedText,
          remixInstructions,
          regenerateAudio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remix section');
      }

      setSuccess(data.changeExplanation || 'Section remixed successfully!');
      setUsage(data.usage);

      // Call onRemixComplete with new script and audio URL
      setTimeout(() => {
        onRemixComplete(data.newScript, data.audioUrl);
      }, 2000);
    } catch (err) {
      console.error('Remix error:', err);
      setError(err instanceof Error ? err.message : 'Failed to remix section');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingRemixes = usage ? usage.limit - usage.used : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-neutral-900 rounded-xl border border-neutral-800 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Remix Script Section</h2>
            <p className="text-sm text-neutral-400 mt-1">
              Select a section of the script and describe how you'd like it changed
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Usage indicator */}
          {usage && (
            <div className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
              <div>
                <div className="text-sm text-neutral-400">Remixes this month</div>
                <div className="text-lg font-semibold text-white">
                  {usage.used} / {usage.limit}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-neutral-400">Plan</div>
                <div className="text-lg font-semibold text-primary capitalize">{usage.tier}</div>
              </div>
            </div>
          )}

          {/* Script display */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              1. Select the section you want to change
            </label>
            <div
              ref={scriptRef}
              onMouseUp={handleMouseUp}
              className="p-4 bg-neutral-800 rounded-lg border-2 border-neutral-700 text-neutral-200 leading-relaxed select-text cursor-text max-h-96 overflow-y-auto"
              style={{ userSelect: 'text' }}
            >
              {scriptText}
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Tip: Highlight text with your cursor to select a section. Select at least 20 characters.
            </p>
          </div>

          {/* Selected section display */}
          {selectedText && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Selected section ({selectedText.split(' ').length} words)
              </label>
              <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-lg text-white">
                "{selectedText}"
              </div>
            </div>
          )}

          {/* Remix instructions */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              2. Describe what you'd like to change
            </label>
            <textarea
              value={remixInstructions}
              onChange={(e) => setRemixInstructions(e.target.value)}
              placeholder="E.g., 'Make this section more energetic and motivating' or 'Change the metaphor to something related to athletics'"
              className="w-full px-4 py-3 bg-neutral-800 border-2 border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:border-primary focus:outline-none resize-none"
              rows={4}
              disabled={isSubmitting}
            />
            <p className="text-xs text-neutral-500 mt-2">
              Be specific about what you want changed. The AI will regenerate just this section while keeping the rest of the script the same.
            </p>
          </div>

          {/* Regenerate audio option */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="regenerate-audio"
              checked={regenerateAudio}
              onChange={(e) => setRegenerateAudio(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-primary focus:ring-primary focus:ring-offset-0"
              disabled={isSubmitting}
            />
            <div>
              <label htmlFor="regenerate-audio" className="text-sm font-medium text-neutral-300 cursor-pointer">
                Regenerate audio with new script
              </label>
              <p className="text-xs text-neutral-500 mt-1">
                This will create new audio including your changes. Adds ~30-60 seconds to processing time.
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="p-4 bg-primary/20 border border-primary/50 rounded-lg text-white text-sm flex items-start gap-2">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {success}
            </div>
          )}

          {/* Submit button */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-neutral-400 hover:text-white transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedText || !remixInstructions || remainingRemixes <= 0}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                isSubmitting || !selectedText || !remixInstructions || remainingRemixes <= 0
                  ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  : 'bg-primary text-neutral-950 hover:bg-primary/90'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Remixing...
                </>
              ) : (
                <>
                  Remix Section
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {remainingRemixes <= 0 && (
            <div className="text-center p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 text-sm">
                You've used all your remixes for this month.{' '}
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-primary hover:underline font-semibold"
                >
                  Upgrade your plan
                </button>{' '}
                to get more remixes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {usage && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentTier={usage.tier as SubscriptionTier}
          limitType="remixes"
          currentUsage={usage.used}
          limit={usage.limit}
        />
      )}
    </div>
  );
}
