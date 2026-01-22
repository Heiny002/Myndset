'use client';

interface Meditation {
  id: string;
  title: string;
  description: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  created_at: string;
  techniques: any;
}

interface MeditationCardProps {
  meditation: Meditation;
  onPlay: (meditation: Meditation) => void;
}

export default function MeditationCard({ meditation, onPlay }: MeditationCardProps) {
  const hasAudio = !!meditation.audio_url;
  const metadata = (meditation.techniques as any) || {};
  const status = metadata?.status || 'generating';

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="group rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-all hover:border-neutral-700 hover:bg-neutral-900">
      <div className="flex items-start justify-between gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
            <svg
              className="h-7 w-7 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="mb-1 truncate text-lg font-semibold text-white">
            {meditation.title}
          </h3>
          {meditation.description && (
            <p className="mb-3 line-clamp-2 text-sm text-neutral-400">
              {meditation.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatDuration(meditation.audio_duration_seconds)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDate(meditation.created_at)}
            </span>
            {metadata?.audio_voice_name && (
              <>
                <span>•</span>
                <span>Voice: {metadata.audio_voice_name}</span>
              </>
            )}
          </div>

          {/* Status Badge */}
          <div className="mt-3">
            {status === 'approved' && hasAudio && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Ready
              </span>
            )}
            {status === 'approved' && !hasAudio && (
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-500">
                <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
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
                Generating Audio
              </span>
            )}
            {status === 'pending_approval' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Pending Review
              </span>
            )}
          </div>
        </div>

        {/* Play Button */}
        {hasAudio && (
          <button
            onClick={() => onPlay(meditation)}
            className="flex-shrink-0 rounded-lg bg-primary px-4 py-2 font-medium text-neutral-950 transition-colors hover:bg-primary/90"
          >
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="hidden sm:inline">Play</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
