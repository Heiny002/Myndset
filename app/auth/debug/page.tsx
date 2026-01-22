'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AuthDebugPage() {
  const [email, setEmail] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAuth = async () => {
    setIsLoading(true);
    const baseUrl = window.location.origin;
    const redirect = '/dashboard';
    const redirectTo = `${baseUrl}/auth/callback?next=${encodeURIComponent(redirect)}`;

    setDebugInfo({
      baseUrl,
      redirect,
      redirectTo,
      encodedRedirect: encodeURIComponent(redirect),
    });

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      setDebugInfo((prev: any) => ({
        ...prev,
        success: !error,
        error: error?.message,
      }));
    } catch (err) {
      setDebugInfo((prev: any) => ({
        ...prev,
        success: false,
        error: String(err),
      }));
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[#00ff88] hover:underline mb-4 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-3xl font-bold text-white mb-6">Auth Debug Page</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Test Magic Link</h2>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="test@example.com"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white mb-4"
          />

          <button
            onClick={testAuth}
            disabled={isLoading || !email}
            className="px-6 py-2 bg-[#00ff88] text-black font-semibold rounded hover:bg-[#00cc6a] disabled:bg-gray-700 disabled:text-gray-400"
          >
            {isLoading ? 'Testing...' : 'Send Test Magic Link'}
          </button>
        </div>

        {debugInfo && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>

            <div className="space-y-3 font-mono text-sm">
              <div>
                <div className="text-gray-400">Base URL:</div>
                <div className="text-white bg-gray-800 p-2 rounded mt-1 break-all">
                  {debugInfo.baseUrl}
                </div>
              </div>

              <div>
                <div className="text-gray-400">Redirect Path:</div>
                <div className="text-white bg-gray-800 p-2 rounded mt-1">
                  {debugInfo.redirect}
                </div>
              </div>

              <div>
                <div className="text-gray-400">Full emailRedirectTo:</div>
                <div className="text-white bg-gray-800 p-2 rounded mt-1 break-all">
                  {debugInfo.redirectTo}
                </div>
              </div>

              <div>
                <div className="text-gray-400">Encoded Redirect:</div>
                <div className="text-white bg-gray-800 p-2 rounded mt-1">
                  {debugInfo.encodedRedirect}
                </div>
              </div>

              {debugInfo.success !== undefined && (
                <div>
                  <div className="text-gray-400">Result:</div>
                  <div
                    className={`p-2 rounded mt-1 ${
                      debugInfo.success
                        ? 'text-green-400 bg-green-900/20'
                        : 'text-red-400 bg-red-900/20'
                    }`}
                  >
                    {debugInfo.success ? '✓ Magic link sent successfully' : `✗ Error: ${debugInfo.error}`}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded">
              <p className="text-yellow-300 text-sm">
                <strong>Check your email</strong> and look at the confirmation link. The{' '}
                <code className="bg-gray-800 px-1 py-0.5 rounded">redirect_to</code> parameter should
                match the "Full emailRedirectTo" value shown above.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
