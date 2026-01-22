'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'An authentication error occurred';

  return (
    <div className="max-w-md w-full text-center">
      {/* Error Icon */}
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">Authentication Error</h1>

      <p className="text-gray-400 mb-8">{message}</p>

      <div className="space-y-4">
        <p className="text-gray-500 text-sm">This could happen if:</p>
        <ul className="text-gray-500 text-sm text-left list-disc list-inside space-y-2">
          <li>The magic link has expired (links are valid for 24 hours)</li>
          <li>The link has already been used</li>
          <li>The link was copied incorrectly</li>
        </ul>
      </div>

      <div className="mt-8 space-y-4">
        <Link
          href="/auth/signup"
          className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#00ff88] text-black font-semibold rounded-lg hover:bg-[#00cc6a] transition-colors"
        >
          Try Again
        </Link>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-md w-full text-center">
      <div className="animate-pulse">
        <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full mb-8"></div>
        <div className="h-8 bg-gray-800 rounded w-2/3 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-800 rounded w-3/4 mx-auto"></div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-white">
            Myndset
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Suspense fallback={<LoadingState />}>
          <ErrorContent />
        </Suspense>
      </main>

      <footer className="border-t border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          Need help?{' '}
          <a href="mailto:hello@trymyndset.com" className="text-[#00ff88] hover:underline">
            Contact support
          </a>
        </div>
      </footer>
    </div>
  );
}
