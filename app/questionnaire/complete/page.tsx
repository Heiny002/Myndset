'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import UpgradeModal from '@/components/UpgradeModal';
import type { SubscriptionTier } from '@/lib/usage/tracking';

export default function QuestionnaireCompletePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userTier, setUserTier] = useState<SubscriptionTier>('free');
  const [usage, setUsage] = useState<{ current: number; limit: number } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      // If user just authenticated after questionnaire, save pending responses
      if (user) {
        const pendingQuestionnaire = sessionStorage.getItem('pendingQuestionnaire');
        if (pendingQuestionnaire) {
          try {
            const responses = JSON.parse(pendingQuestionnaire);

            // Check if user has reached limit before saving
            const { data: userData } = await supabase
              .from('users')
              .select('subscription_tier, meditations_generated, meditations_limit')
              .eq('id', user.id)
              .single();

            if (userData) {
              setUserTier(userData.subscription_tier as SubscriptionTier);
              setUsage({
                current: userData.meditations_generated,
                limit: userData.meditations_limit,
              });

              // Check if at limit
              if (userData.meditations_generated >= userData.meditations_limit) {
                setShowUpgradeModal(true);
                return; // Don't save questionnaire yet
              }
            }

            // Save questionnaire and increment count
            const { data: questionnaireData, error: insertError } = await supabase
              .from('questionnaire_responses')
              .insert({
                user_id: user.id,
                tier: 1,
                responses: responses,
                completed_at: new Date().toISOString(),
              })
              .select('id')
              .single();

            if (!insertError && questionnaireData) {
              // Generate title using Claude API (fire and forget, don't block UX)
              fetch('/api/questionnaire/generate-title', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  questionnaire_id: questionnaireData.id,
                  responses: responses,
                }),
              }).catch((err) => console.error('Failed to generate title:', err));
            }

            // Increment meditation count
            await supabase.rpc('increment_meditation_count', {
              check_user_id: user.id,
            });

            sessionStorage.removeItem('pendingQuestionnaire');
          } catch (error) {
            console.error('Error saving pending questionnaire:', error);
          }
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Myndset
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg mx-auto text-center">
          {/* Success Icon */}
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your Profile is Complete
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-400 mb-8">
            We&apos;re analyzing your responses to craft a personalized meditation designed for your
            specific goals and challenges.
          </p>

          {/* What happens next */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              What happens next?
            </h2>
            <ol className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00ff88]/20 text-[#00ff88] rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </span>
                <span className="text-gray-300">
                  Our AI analyzes your profile to select the optimal techniques for you
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00ff88]/20 text-[#00ff88] rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </span>
                <span className="text-gray-300">
                  We craft a personalized meditation script tailored to your goals
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-[#00ff88]/20 text-[#00ff88] rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </span>
                <span className="text-gray-300">
                  Your meditation is professionally voiced and delivered to your inbox
                </span>
              </li>
            </ol>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full text-sm">
              <svg className="w-4 h-4 text-[#00ff88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-300">
                Expected delivery: <span className="text-white font-medium">Within 24 hours</span>
              </span>
            </div>
          </div>

          {/* CTA */}
          {isAuthenticated === false && (
            <div className="bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg p-4 mb-6">
              <p className="text-gray-300 text-sm mb-3">
                Create an account to track your meditation and get notified when it&apos;s ready.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center px-6 py-2 bg-[#00ff88] text-black font-semibold rounded-lg hover:bg-[#00cc6a] transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}

          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {isAuthenticated ? "Go to Dashboard" : "Back to Home"}
          </Link>
        </div>
      </main>

      {/* Upgrade Modal */}
      {usage && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentTier={userTier}
          limitType="meditations"
          currentUsage={usage.current}
          limit={usage.limit}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          Questions? Contact us at{' '}
          <a href="mailto:hello@trymyndset.com" className="text-[#00ff88] hover:underline">
            hello@trymyndset.com
          </a>
        </div>
      </footer>
    </div>
  );
}
