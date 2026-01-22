import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PricingClient from './PricingClient';

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get current subscription if user is logged in
  let currentTier = 'free';
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    currentTier = userData?.subscription_tier || 'free';
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Navigation */}
      <nav className="border-b border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Myndset
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signup"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      <PricingClient currentTier={currentTier} isAuthenticated={!!user} />
    </div>
  );
}
