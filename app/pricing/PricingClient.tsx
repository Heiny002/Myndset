'use client';

import { useState } from 'react';
import { STRIPE_PLANS, StripePlan, calculateAnnualSavings } from '@/lib/stripe/client';

interface PricingClientProps {
  currentTier: string;
  isAuthenticated: boolean;
}

export default function PricingClient({ currentTier, isAuthenticated }: PricingClientProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSelectPlan = async (tier: StripePlan) => {
    if (tier === 'free') {
      // Free plan - redirect to signup
      window.location.href = '/auth/signup';
      return;
    }

    if (!isAuthenticated) {
      // Not logged in - redirect to signup with plan info
      window.location.href = `/auth/signup?plan=${tier}&billing=${billingPeriod}`;
      return;
    }

    setIsLoading(tier);

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingPeriod }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(null);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Performance-Focused Pricing
        </h1>
        <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
          Choose the plan that fits your meditation practice. All plans include AI-generated
          personalized meditations.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            billingPeriod === 'monthly'
              ? 'bg-primary text-neutral-950'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingPeriod('annual')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors relative ${
            billingPeriod === 'annual'
              ? 'bg-primary text-neutral-950'
              : 'bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
        >
          Annual
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-xs font-bold text-white rounded-full">
            Save 17%
          </span>
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {(Object.keys(STRIPE_PLANS) as StripePlan[]).map((tier) => {
          const plan = STRIPE_PLANS[tier];
          const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
          const displayPrice = billingPeriod === 'monthly' ? price : Math.round(price / 12);
          const isCurrentPlan = currentTier.toLowerCase() === tier;
          const annualSavings = calculateAnnualSavings(tier);
          const isPremium = tier === 'premium';

          return (
            <div
              key={tier}
              className={`relative rounded-2xl border-2 p-8 transition-all ${
                isPremium
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                  : 'border-neutral-800 bg-neutral-900/50'
              }`}
            >
              {/* Popular Badge */}
              {isPremium && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-neutral-950 text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              {/* Plan Name */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${displayPrice}</span>
                  <span className="text-neutral-400">/month</span>
                </div>
                {billingPeriod === 'annual' && price > 0 && (
                  <div className="mt-2 text-sm text-neutral-400">
                    ${price}/year • Save ${annualSavings}
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-neutral-300">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(tier)}
                disabled={isCurrentPlan || isLoading === tier}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  isCurrentPlan
                    ? 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                    : isPremium
                      ? 'bg-primary text-neutral-950 hover:bg-primary/90'
                      : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                {isLoading === tier ? (
                  <span className="flex items-center justify-center gap-2">
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
                    Loading...
                  </span>
                ) : isCurrentPlan ? (
                  'Current Plan'
                ) : tier === 'free' ? (
                  'Get Started Free'
                ) : (
                  `Upgrade to ${plan.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div className="border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Can I change plans or cancel anytime?
            </h3>
            <p className="text-neutral-400">
              Yes. You can upgrade, downgrade, or cancel your subscription at any time from your
              dashboard. Changes take effect at the end of your current billing period.
            </p>
          </div>
          <div className="border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              What happens to my meditations if I downgrade?
            </h3>
            <p className="text-neutral-400">
              All previously generated meditations remain accessible forever. You'll just have a
              lower limit for new meditations each month based on your new plan.
            </p>
          </div>
          <div className="border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              How long does it take to generate a meditation?
            </h3>
            <p className="text-neutral-400">
              Meditations are typically ready within 24 hours. You'll receive an email notification
              when your meditation is ready to listen.
            </p>
          </div>
          <div className="border border-neutral-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-neutral-400">
              We offer a 30-day money-back guarantee. If you're not satisfied with your
              personalized meditations, contact us for a full refund.
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="mt-20 text-center">
        <p className="text-neutral-400 mb-4">
          Have questions? Need a custom plan for your team?
        </p>
        <a
          href="mailto:hello@trymyndset.com"
          className="inline-flex items-center gap-2 text-primary hover:underline font-semibold"
        >
          Contact us
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
      </div>
    </main>
  );
}
