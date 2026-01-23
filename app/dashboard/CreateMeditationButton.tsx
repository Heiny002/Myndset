'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UpgradeModal from '@/components/UpgradeModal';
import type { SubscriptionTier, UserUsage } from '@/lib/usage/tracking';

interface CreateMeditationButtonProps {
  usage: UserUsage;
  tier: SubscriptionTier;
}

export default function CreateMeditationButton({ usage, tier }: CreateMeditationButtonProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const router = useRouter();

  const canCreate = usage.meditations_generated < usage.meditations_limit;

  const handleClick = (e: React.MouseEvent) => {
    if (!canCreate) {
      e.preventDefault();
      setShowUpgradeModal(true);
    }
  };

  return (
    <>
      <Link
        href="/questionnaire"
        className="group rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-900/30 p-6 transition-all hover:border-primary hover:bg-primary/5"
        onClick={handleClick}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 transition-colors group-hover:bg-primary/30">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white transition-colors group-hover:text-primary">
              Create New Meditation
            </h3>
            <p className="text-sm text-neutral-400">
              {canCreate ? 'Take the questionnaire' : `${usage.meditations_generated}/${usage.meditations_limit} used this month`}
            </p>
          </div>
        </div>
      </Link>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={tier}
        limitType="meditations"
        currentUsage={usage.meditations_generated}
        limit={usage.meditations_limit}
      />
    </>
  );
}
