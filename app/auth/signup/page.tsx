'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function SignupForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Determine the redirect URL based on environment
      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(redirect)}`;

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Success state - show email sent message
  if (isSuccess) {
    return (
      <div className="max-w-md w-full text-center">
        {/* Email Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-[#00ff88]/20 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-[#00ff88]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>

        <p className="text-gray-400 mb-6">
          We sent a magic link to{' '}
          <span className="text-white font-medium">{email}</span>
        </p>

        <p className="text-gray-500 text-sm mb-8">
          Click the link in the email to sign in. The link will expire in 24 hours.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}
            className="text-[#00ff88] hover:underline text-sm"
          >
            Use a different email
          </button>

          <div className="text-gray-500 text-sm">
            Didn&apos;t receive the email?{' '}
            <button
              onClick={handleSubmit}
              className="text-[#00ff88] hover:underline"
              disabled={isLoading}
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
        <p className="text-gray-400">
          Sign in with your email to access your personalized meditation
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#00ff88] focus:outline-none transition-colors"
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Error Message */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !email}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            isLoading || !email
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-[#00ff88] text-black hover:bg-[#00cc6a]'
          }`}
        >
          {isLoading ? (
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
              Sending magic link...
            </>
          ) : (
            <>
              Continue with Email
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
      </form>

      {/* Benefits */}
      <div className="mt-8 pt-8 border-t border-gray-800">
        <p className="text-sm text-gray-500 text-center mb-4">
          No password required - we&apos;ll email you a secure link
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00ff88]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00ff88]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>No password</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#00ff88]" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Free</span>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-gray-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-md w-full text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-800 rounded w-2/3 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mx-auto mb-8"></div>
        <div className="h-12 bg-gray-800 rounded w-full mb-4"></div>
        <div className="h-12 bg-gray-800 rounded w-full"></div>
      </div>
    </div>
  );
}

export default function SignupPage() {
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
          <SignupForm />
        </Suspense>
      </main>
    </div>
  );
}
