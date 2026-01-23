'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SubscriptionTier } from '@/lib/usage/tracking';

interface UserData {
  id: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_cycle_start: string;
  billing_cycle_anchor: number;
  meditations_generated: number;
  meditations_limit: number;
  remixes_this_month: number;
  remixes_limit: number;
}

interface SubscriptionSectionProps {
  userId: string;
  userData: UserData;
}

export default function SubscriptionSection({ userId, userData }: SubscriptionSectionProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const tier = userData.subscription_tier;
  const hasActiveSubscription = tier !== 'free' && userData.stripe_subscription_id;

  // Calculate next billing date
  const nextBillingDate = hasActiveSubscription
    ? new Date(
        new Date(userData.billing_cycle_start).setMonth(
          new Date(userData.billing_cycle_start).getMonth() + 1
        )
      ).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const tierInfo = {
    free: {
      name: 'Free',
      price: '$0',
      features: ['1 meditation per month', '2 remixes per month'],
    },
    basic: {
      name: 'Basic',
      price: '$9/month',
      features: ['10 meditations per month', '10 remixes per month', 'Priority support'],
    },
    premium: {
      name: 'Premium',
      price: '$19/month',
      features: [
        '45 meditations per month',
        '45 remixes per month',
        'Priority support',
        'Advanced customization',
      ],
    },
  };

  const currentTier = tierInfo[tier];

  const handleCancelSubscription = async () => {
    if (!userData.stripe_subscription_id) return;

    setIsCanceling(true);

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: userData.stripe_subscription_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      // Refresh the page to show updated subscription status
      window.location.reload();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setIsCanceling(false);
      setShowCancelModal(false);
    }
  };

  const handleManageBilling = async () => {
    if (!userData.stripe_customer_id) return;

    setIsLoadingPortal(true);

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: userData.stripe_customer_id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Subscription</h2>
          <p className="text-sm text-neutral-400">Manage your subscription and billing</p>
        </div>
        <span className="rounded-full bg-primary/20 px-4 py-1.5 text-sm font-semibold uppercase text-primary">
          {currentTier.name}
        </span>
      </div>

      {/* Current Plan Details */}
      <div className="mb-6 rounded-lg border border-neutral-700 bg-neutral-800/50 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-lg font-semibold text-white">{currentTier.name} Plan</h3>
          <p className="text-2xl font-bold text-white">{currentTier.price}</p>
        </div>
        <ul className="space-y-2">
          {currentTier.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-neutral-300">
              <svg className="h-5 w-5 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* Usage Stats */}
        <div className="mt-4 space-y-2 border-t border-neutral-700 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Meditations this month</span>
            <span className="font-semibold text-white">
              {userData.meditations_generated}/{userData.meditations_limit}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Remixes this month</span>
            <span className="font-semibold text-white">
              {userData.remixes_this_month}/{userData.remixes_limit}
            </span>
          </div>
        </div>
      </div>

      {/* Billing Information */}
      {hasActiveSubscription && nextBillingDate && (
        <div className="mb-6 rounded-lg bg-neutral-800/30 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-400">Next billing date</span>
            <span className="font-semibold text-white">{nextBillingDate}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {tier === 'free' ? (
          <Link
            href="/pricing"
            className="block w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-neutral-950 transition-colors hover:bg-primary/90"
          >
            Upgrade Plan
          </Link>
        ) : (
          <>
            {tier === 'basic' && (
              <Link
                href="/pricing"
                className="block w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-neutral-950 transition-colors hover:bg-primary/90"
              >
                Upgrade to Premium
              </Link>
            )}

            {hasActiveSubscription && (
              <>
                <button
                  onClick={handleManageBilling}
                  disabled={isLoadingPortal}
                  className="block w-full rounded-lg border border-neutral-700 px-6 py-3 text-center font-medium text-neutral-300 transition-colors hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isLoadingPortal ? 'Loading...' : 'Manage Billing & Invoices'}
                </button>

                <button
                  onClick={() => setShowCancelModal(true)}
                  className="block w-full rounded-lg px-6 py-3 text-center text-sm font-medium text-red-400 transition-colors hover:bg-red-900/20"
                >
                  Cancel Subscription
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
          onClick={() => setShowCancelModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/20">
              <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="mb-2 text-xl font-bold text-white">Cancel Subscription?</h3>
            <p className="mb-4 text-sm text-neutral-400">
              Are you sure you want to cancel your {currentTier.name} subscription? You'll be downgraded to the Free
              plan at the end of your current billing period.
            </p>

            <div className="mb-4 rounded-lg bg-neutral-800/50 p-3">
              <p className="mb-1 text-xs font-semibold uppercase text-neutral-500">You'll still have access to:</p>
              <ul className="space-y-1 text-sm text-neutral-300">
                {currentTier.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-neutral-500">Until {nextBillingDate}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isCanceling}
                className="flex-1 rounded-lg border border-neutral-700 px-4 py-2 font-medium text-neutral-300 transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isCanceling ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
