'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessBanner() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check for success parameter (from Stripe checkout)
    const success = searchParams.get('success');
    const sessionId = searchParams.get('session_id');

    if (success === 'true' && sessionId) {
      setMessage({
        type: 'success',
        text: '🎉 Subscription activated! You can now generate more meditations.',
      });
      setVisible(true);

      // Remove query params from URL after showing message
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('success');
        url.searchParams.delete('session_id');
        window.history.replaceState({}, '', url.toString());
      }, 100);
    }
  }, [searchParams]);

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible || !message) return null;

  return (
    <div
      className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 rounded-lg border-2 p-4 shadow-lg transition-all ${
        message.type === 'success'
          ? 'border-primary bg-primary/10 text-white'
          : 'border-red-500 bg-red-500/10 text-red-400'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {message.type === 'success' ? (
          <svg
            className="w-6 h-6 text-primary flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6 text-red-500 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )}

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium">{message.text}</p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="text-neutral-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
