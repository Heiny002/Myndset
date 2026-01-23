/**
 * Usage Stats Component
 *
 * Displays user's current usage statistics for meditations and remixes
 */

import Link from 'next/link';
import { UserUsage, calculateUsagePercentage } from '@/lib/usage/tracking';

interface UsageStatsProps {
  usage: UserUsage;
  tier: 'free' | 'basic' | 'premium';
}

export default function UsageStats({ usage, tier }: UsageStatsProps) {
  const meditationPercentage = calculateUsagePercentage(
    usage.meditations_generated,
    usage.meditations_limit
  );
  const remixPercentage = calculateUsagePercentage(
    usage.remixes_this_month,
    usage.remixes_limit
  );

  // Determine if user is at or near limits
  const meditationLimitReached = usage.meditations_generated >= usage.meditations_limit;
  const remixLimitReached = usage.remixes_this_month >= usage.remixes_limit;
  const nearMeditationLimit = meditationPercentage >= 80 && !meditationLimitReached;
  const nearRemixLimit = remixPercentage >= 80 && !remixLimitReached;

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Usage This Month</h3>
        <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-300 capitalize">
          {tier} Plan
        </span>
      </div>

      {/* Meditation Usage */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-neutral-400">Meditations Generated</span>
          <span className="text-sm font-semibold text-white">
            {usage.meditations_generated} / {usage.meditations_limit}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className={`h-full transition-all ${
              meditationLimitReached
                ? 'bg-red-500'
                : nearMeditationLimit
                  ? 'bg-yellow-500'
                  : 'bg-primary'
            }`}
            style={{ width: `${meditationPercentage}%` }}
          />
        </div>

        {/* Warning messages */}
        {meditationLimitReached && (
          <p className="mt-2 text-xs text-red-400">
            ⚠️ Limit reached. Upgrade to generate more meditations.
          </p>
        )}
        {nearMeditationLimit && (
          <p className="mt-2 text-xs text-yellow-400">
            ⚡ Approaching limit. Consider upgrading soon.
          </p>
        )}
      </div>

      {/* Remix Usage */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-neutral-400">Remixes</span>
          <span className="text-sm font-semibold text-white">
            {usage.remixes_this_month} / {usage.remixes_limit}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className={`h-full transition-all ${
              remixLimitReached
                ? 'bg-red-500'
                : nearRemixLimit
                  ? 'bg-yellow-500'
                  : 'bg-primary'
            }`}
            style={{ width: `${remixPercentage}%` }}
          />
        </div>

        {/* Warning messages */}
        {remixLimitReached && (
          <p className="mt-2 text-xs text-red-400">
            ⚠️ Remix limit reached. Upgrade for more.
          </p>
        )}
        {nearRemixLimit && (
          <p className="mt-2 text-xs text-yellow-400">
            ⚡ Approaching remix limit.
          </p>
        )}
      </div>

      {/* Billing Cycle Info */}
      <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-400">Resets in</span>
          <span className="font-semibold text-white">
            {usage.days_until_reset} {usage.days_until_reset === 1 ? 'day' : 'days'}
          </span>
        </div>
      </div>

      {/* Upgrade CTA */}
      {(meditationLimitReached || remixLimitReached || nearMeditationLimit) && tier !== 'premium' && (
        <Link
          href="/pricing"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-primary/90"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          Upgrade to {tier === 'free' ? 'Basic' : 'Premium'}
        </Link>
      )}
    </div>
  );
}
