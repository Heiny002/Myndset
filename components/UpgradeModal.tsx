'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SubscriptionTier } from '@/lib/usage/tracking';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  limitType: 'meditations' | 'remixes';
  currentUsage: number;
  limit: number;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  currentTier,
  limitType,
  currentUsage,
  limit,
}: UpgradeModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200); // Wait for fade animation
  };

  if (!isOpen) return null;

  // Determine recommended tier
  const recommendedTier = currentTier === 'free' ? 'basic' : 'premium';
  const tierInfo = {
    basic: {
      price: '$9',
      period: 'month',
      meditations: 10,
      remixes: 10,
    },
    premium: {
      price: '$19',
      period: 'month',
      meditations: 45,
      remixes: 45,
    },
  };

  const recommended = tierInfo[recommendedTier];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-900 p-8 shadow-2xl transition-transform duration-200 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-neutral-400 transition-colors hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-3 text-center text-2xl font-bold text-white">
          You&apos;ve Reached Your Limit
        </h2>

        {/* Description */}
        <p className="mb-6 text-center text-neutral-400">
          You&apos;ve used <span className="font-semibold text-white">{currentUsage}/{limit}</span>{' '}
          {limitType} this month on the{' '}
          <span className="font-semibold text-white capitalize">{currentTier}</span> tier.
        </p>

        {/* Current tier badge */}
        <div className="mb-6 rounded-lg border border-neutral-700 bg-neutral-800/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-400">Current Plan</span>
            <span className="rounded-full bg-neutral-700 px-3 py-1 text-xs font-semibold uppercase text-white">
              {currentTier}
            </span>
          </div>
          <div className="text-sm text-neutral-400">
            {currentTier === 'free' ? (
              <>1 meditation & 2 remixes per month</>
            ) : currentTier === 'basic' ? (
              <>10 meditations & 10 remixes per month</>
            ) : (
              <>45 meditations & 45 remixes per month</>
            )}
          </div>
        </div>

        {/* Recommended upgrade */}
        <div className="mb-8 rounded-lg border-2 border-primary bg-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="mb-1 text-sm font-medium text-primary">Recommended</div>
              <div className="text-lg font-bold uppercase text-white">{recommendedTier}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{recommended.price}</div>
              <div className="text-sm text-neutral-400">/{recommended.period}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-neutral-300">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{recommended.meditations} meditations per month</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{recommended.remixes} remixes per month</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Priority support</span>
            </div>
            {recommendedTier === 'premium' && (
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Advanced customization options</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full rounded-lg bg-primary px-6 py-3 text-center font-semibold text-neutral-950 transition-colors hover:bg-primary/90"
            onClick={handleClose}
          >
            Upgrade to {recommendedTier.charAt(0).toUpperCase() + recommendedTier.slice(1)}
          </Link>
          <button
            onClick={handleClose}
            className="block w-full rounded-lg border border-neutral-700 px-6 py-3 text-center font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            Maybe Later
          </button>
        </div>

        {/* Additional info */}
        <p className="mt-4 text-center text-xs text-neutral-500">
          Your usage resets at the start of each billing cycle
        </p>
      </div>
    </div>
  );
}
