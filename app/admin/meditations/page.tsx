import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth/admin';
import MeditationList from './MeditationList';

export default async function AdminMeditationsPage() {
  // Check admin access
  const admin = await isAdmin();
  if (!admin) {
    redirect('/dashboard');
  }

  const adminClient = createAdminClient();

  // Fetch all meditations with audio (completed)
  const { data: meditations, error } = await adminClient
    .from('meditations')
    .select(`
      *,
      users!meditations_user_id_fkey(email, full_name)
    `)
    .not('audio_url', 'is', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching meditations:', error);
  }

  // Fetch version counts for each meditation
  const meditationIds = meditations?.map((m) => m.id) || [];
  const { data: versionCounts } = await adminClient
    .from('meditation_versions')
    .select('meditation_id')
    .in('meditation_id', meditationIds);

  // Count versions per meditation
  const versionCountMap: Record<string, number> = {};
  versionCounts?.forEach((v) => {
    versionCountMap[v.meditation_id] = (versionCountMap[v.meditation_id] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-neutral-950">
      <nav className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/admin" className="text-sm text-neutral-400 hover:text-white">
                ← Back to Dashboard
              </a>
            </div>
            <h1 className="text-xl font-bold text-white">Completed Meditations</h1>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">
            Manage Completed Meditations
          </h2>
          <p className="mt-2 text-neutral-400">
            View, redo, and manage versions of completed meditations with audio.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Completed"
            value={meditations?.length || 0}
            description="Meditations with audio"
          />
          <StatCard
            title="Total Versions"
            value={versionCounts?.length || 0}
            description="Archived versions"
          />
          <StatCard
            title="Users Served"
            value={new Set(meditations?.map((m) => m.user_id)).size || 0}
            description="Unique users"
          />
        </div>

        {/* Meditation List */}
        {meditations && meditations.length > 0 ? (
          <MeditationList meditations={meditations} versionCounts={versionCountMap} />
        ) : (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-12 text-center">
            <p className="text-neutral-400">No completed meditations yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <h3 className="text-sm font-medium text-neutral-400">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </div>
  );
}
