import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/**
 * Get singleton Stripe client instance
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }

  return stripeClient;
}

/**
 * Stripe product and price configuration
 */
export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    priceMonthly: 0,
    priceAnnual: 0,
    stripePriceIdMonthly: null,
    stripePriceIdAnnual: null,
    features: [
      '1 personalized meditation',
      '2 script remixes per month',
      'Standard voice options',
      'Web player access',
    ],
    limitations: {
      meditations: 1,
      remixes: 2,
    },
  },
  basic: {
    name: 'Basic',
    priceMonthly: 9,
    priceAnnual: 90, // 2 months free
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_BASIC_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_ID_BASIC_ANNUAL,
    features: [
      '10 meditations per month',
      '10 script remixes per month',
      'All voice options',
      'Download audio files',
      'Priority support',
    ],
    limitations: {
      meditations: 10,
      remixes: 10,
    },
  },
  premium: {
    name: 'Premium',
    priceMonthly: 19,
    priceAnnual: 190, // 2 months free
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
    stripePriceIdAnnual: process.env.STRIPE_PRICE_ID_PREMIUM_ANNUAL,
    features: [
      '45 meditations per month',
      'Unlimited script remixes',
      'All voice options',
      'Download audio files',
      'Background music (coming soon)',
      'Priority support',
      'Early access to new features',
    ],
    limitations: {
      meditations: 45,
      remixes: 999, // Effectively unlimited
    },
  },
} as const;

export type StripePlan = keyof typeof STRIPE_PLANS;

/**
 * Get plan details by tier name
 */
export function getPlanByTier(tier: string): typeof STRIPE_PLANS[StripePlan] | null {
  const normalizedTier = tier.toLowerCase() as StripePlan;
  return STRIPE_PLANS[normalizedTier] || null;
}

/**
 * Get Stripe price ID for a plan and billing period
 */
export function getStripePriceId(
  tier: StripePlan,
  billingPeriod: 'monthly' | 'annual'
): string | null {
  const plan = STRIPE_PLANS[tier];
  return billingPeriod === 'monthly' ? plan.stripePriceIdMonthly ?? null : plan.stripePriceIdAnnual ?? null;
}

/**
 * Calculate savings for annual billing
 */
export function calculateAnnualSavings(tier: StripePlan): number {
  const plan = STRIPE_PLANS[tier];
  return plan.priceMonthly * 12 - plan.priceAnnual;
}
