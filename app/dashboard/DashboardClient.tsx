'use client';

import { useState, useMemo } from 'react';
import MeditationCard from '@/components/MeditationCard';
import AudioPlayer from '@/components/AudioPlayer';

interface Meditation {
  id: string;
  title: string;
  description: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  created_at: string;
  techniques: any;
}

interface DashboardClientProps {
  meditations: Meditation[];
}

export default function DashboardClient({ meditations }: DashboardClientProps) {
  const [selectedMeditation, setSelectedMeditation] = useState<Meditation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'duration'>('recent');

  // Filter and sort meditations
  const filteredMeditations = useMemo(() => {
    let filtered = meditations;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'duration':
        sorted.sort(
          (a, b) => (b.audio_duration_seconds || 0) - (a.audio_duration_seconds || 0)
        );
        break;
    }

    return sorted;
  }, [meditations, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const ready = meditations.filter((m) => m.audio_url).length;
    const totalDuration = meditations.reduce(
      (sum, m) => sum + (m.audio_duration_seconds || 0),
      0
    );
    return { total: meditations.length, ready, totalMinutes: Math.round(totalDuration / 60) };
  }, [meditations]);

  return (
    <>
      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-neutral-400">Total Meditations</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-2xl font-bold text-primary">{stats.ready}</div>
          <div className="text-sm text-neutral-400">Ready to Play</div>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          <div className="text-2xl font-bold text-white">{stats.totalMinutes}</div>
          <div className="text-sm text-neutral-400">Total Minutes</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search meditations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 pl-10 pr-4 text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="recent">Most Recent</option>
          <option value="title">Title (A-Z)</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      {/* Meditation List */}
      <div className="space-y-4">
        {filteredMeditations.length > 0 ? (
          filteredMeditations.map((meditation) => (
            <MeditationCard
              key={meditation.id}
              meditation={meditation}
              onPlay={setSelectedMeditation}
            />
          ))
        ) : searchQuery ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800">
              <svg className="h-8 w-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">No results found</h3>
            <p className="text-neutral-400">Try adjusting your search terms</p>
          </div>
        ) : null}
      </div>

      {/* Audio Player Modal */}
      {selectedMeditation?.audio_url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl">
            <AudioPlayer
              src={selectedMeditation.audio_url}
              title={selectedMeditation.title}
              onClose={() => setSelectedMeditation(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
