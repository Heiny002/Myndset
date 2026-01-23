'use client';

import type { User } from '@supabase/supabase-js';

interface AccountSectionProps {
  user: User;
}

export default function AccountSection({ user }: AccountSectionProps) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Account Information</h2>
        <p className="text-sm text-neutral-400">Your account details</p>
      </div>

      <div className="space-y-4">
        {/* Email */}
        <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-800/50 p-4">
          <div>
            <p className="text-sm text-neutral-400">Email</p>
            <p className="font-medium text-white">{user.email}</p>
          </div>
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* User ID */}
        <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-4">
          <p className="text-sm text-neutral-400">User ID</p>
          <p className="font-mono text-xs text-neutral-500">{user.id}</p>
        </div>

        {/* Account Created */}
        <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-4">
          <p className="text-sm text-neutral-400">Member since</p>
          <p className="font-medium text-white">
            {new Date(user.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
