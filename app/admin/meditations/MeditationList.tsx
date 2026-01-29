'use client';

import { useState, useRef, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';

// Forward declare AudioPlayerCard before MeditationList uses it
function AudioPlayerCard({
  audioUrl,
  audioRef,
  isPlaying,
  setIsPlaying,
  duration,
}: {
  audioUrl: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  duration: number | null;
}) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [totalDuration, setTotalDuration] = useState<number>(duration || 0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-neutral-300">🎵 Audio Playback</h4>
      <div className="space-y-3 rounded-lg bg-neutral-800/50 p-4">
        {/* Audio Element (hidden) */}
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          preload="metadata"
        />

        {/* Control Bar */}
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="flex-shrink-0 rounded-full bg-primary p-3 text-neutral-950 hover:bg-primary/90 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 4a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75V4.75A.75.75 0 0 0 7.25 4h-1.5zm6 0a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75V4.75a.75.75 0 0 0-.75-.75h-1.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>

          {/* Time Display */}
          <span className="flex-shrink-0 text-xs font-medium text-neutral-400 w-12">
            {formatTime(currentTime)}
          </span>

          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={totalDuration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-2 bg-neutral-700 rounded-full appearance-none cursor-pointer accent-primary"
            aria-label="Progress"
          />

          {/* Total Duration */}
          <span className="flex-shrink-0 text-xs font-medium text-neutral-400 w-12 text-right">
            {formatTime(totalDuration)}
          </span>

          {/* Download Button */}
          <a
            href={audioUrl}
            download
            className="flex-shrink-0 p-2 text-neutral-400 hover:text-primary transition-colors"
            aria-label="Download"
            title="Download audio"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </a>
        </div>

        {/* Audio Status */}
        <div className="text-xs text-neutral-500">
          {isPlaying ? (
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Playing
            </span>
          ) : (
            <span>Ready to play</span>
          )}
        </div>
      </div>
    </div>
  );
}

type Meditation = {
  id: string;
  title: string;
  description: string | null;
  script_text: string;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  session_length: string;
  techniques: any;
  created_at: string;
  user_id: string;
  users: {
    email: string;
    full_name: string | null;
  } | null;
};

export default function MeditationList({
  meditations,
  versionCounts,
}: {
  meditations: Meditation[];
  versionCounts: Record<string, number>;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'energizing' | 'calming'>('all');

  // Filter meditations
  const filteredMeditations = meditations.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.users?.email.toLowerCase().includes(searchTerm.toLowerCase());

    const scriptStyle = m.techniques?.scriptStyle || 'energizing';
    const matchesMode = modeFilter === 'all' || scriptStyle === modeFilter;

    return matchesSearch && matchesMode;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by title, description, or user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setModeFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              modeFilter === 'all'
                ? 'bg-primary text-neutral-950'
                : 'border border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            All Modes
          </button>
          <button
            onClick={() => setModeFilter('energizing')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              modeFilter === 'energizing'
                ? 'bg-orange-500 text-white'
                : 'border border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            Energizing
          </button>
          <button
            onClick={() => setModeFilter('calming')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              modeFilter === 'calming'
                ? 'bg-blue-500 text-white'
                : 'border border-neutral-700 text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            Calming
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-neutral-400">
        Showing {filteredMeditations.length} of {meditations.length} meditations
      </p>

      {/* Meditation Cards */}
      <div className="space-y-4">
        {filteredMeditations.map((meditation) => (
          <MeditationCard
            key={meditation.id}
            meditation={meditation}
            versionCount={versionCounts[meditation.id] || 0}
          />
        ))}
      </div>

      {filteredMeditations.length === 0 && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-12 text-center">
          <p className="text-neutral-400">No meditations match your filters.</p>
        </div>
      )}
    </div>
  );
}

function MeditationCard({
  meditation,
  versionCount,
}: {
  meditation: Meditation;
  versionCount: number;
}) {
  const [showRedoModal, setShowRedoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/admin/delete-meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meditationId: meditation.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete meditation');
      }

      setShowDeleteModal(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting meditation:', error);
      alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const scriptStyle = meditation.techniques?.scriptStyle || 'energizing';
  const wordCount = meditation.script_text.split(/\s+/).filter(Boolean).length;
  const duration = meditation.audio_duration_seconds
    ? `${Math.floor(meditation.audio_duration_seconds / 60)}:${(meditation.audio_duration_seconds % 60).toString().padStart(2, '0')}`
    : `~${Math.round(wordCount / 145)} min`;

  // Check if this is a test meditation (created via admin test flow)
  const isTestMeditation = meditation.techniques?.script_type === 'energizing' && meditation.techniques?.user_type;

  return (
    <>
      <div className={`rounded-lg border p-6 ${
        isTestMeditation
          ? 'border-purple-500/30 bg-purple-500/5'
          : 'border-neutral-800 bg-neutral-900'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header */}
            <div className="mb-3 flex items-center gap-3">
              <h3 className={`text-lg font-semibold ${isTestMeditation ? 'text-purple-300' : 'text-white'}`}>
                {meditation.title}
              </h3>
              {isTestMeditation && (
                <span className="rounded-full bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-400 border border-purple-500/30">
                  🧪 Test
                </span>
              )}
              <ModeBadge mode={scriptStyle} />
              {versionCount > 0 && (
                <span className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-400">
                  {versionCount} {versionCount === 1 ? 'version' : 'versions'}
                </span>
              )}
            </div>

            {/* Description */}
            {meditation.description && (
              <p className="mb-3 text-sm text-neutral-400">{meditation.description}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
              <span>
                <strong className="text-neutral-400">User:</strong>{' '}
                {meditation.users?.email || 'Unknown'}
              </span>
              <span>•</span>
              <span>
                <strong className="text-neutral-400">Duration:</strong> {duration}
              </span>
              <span>•</span>
              <span>
                <strong className="text-neutral-400">Created:</strong>{' '}
                {new Date(meditation.created_at).toLocaleDateString()}
              </span>
              <span>•</span>
              <span>
                <strong className="text-neutral-400">Words:</strong>{' '}
                {wordCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="ml-4 flex flex-col gap-2">
            <a
              href={`/admin/script/${meditation.id}`}
              className="whitespace-nowrap rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              View Script
            </a>
            <button
              onClick={() => setShowRedoModal(true)}
              className="whitespace-nowrap rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Redo Meditation
            </button>
            {versionCount > 0 && (
              <a
                href={`/admin/meditations/${meditation.id}/versions`}
                className="whitespace-nowrap rounded-lg border border-neutral-700 px-4 py-2 text-center text-sm font-medium text-neutral-300 hover:bg-neutral-800"
              >
                View Versions
              </a>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="whitespace-nowrap rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Audio Player */}
        {meditation.audio_url && (
          <div className="mt-4 border-t border-neutral-800 pt-4">
            <AudioPlayerCard
              audioUrl={meditation.audio_url}
              audioRef={audioRef}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              duration={meditation.audio_duration_seconds}
            />
          </div>
        )}
      </div>

      {/* Redo Modal */}
      {showRedoModal && (
        <RedoModal
          meditation={meditation}
          currentMode={scriptStyle}
          onClose={() => setShowRedoModal(false)}
          onSuccess={() => {
            setShowRedoModal(false);
            // Delay refresh to allow success message to show
            setTimeout(() => router.refresh(), 500);
          }}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          title="Delete Meditation"
          description="This meditation and its associated audio file will be permanently deleted. This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  const styles = {
    energizing: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
    calming: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  } as const;

  const labels = {
    energizing: '⚡ Energizing',
    calming: '🌊 Calming',
  } as const;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[mode as keyof typeof styles] || 'bg-neutral-700 text-neutral-300'}`}
    >
      {labels[mode as keyof typeof labels] || mode}
    </span>
  );
}

function RedoModal({
  meditation,
  currentMode,
  onClose,
  onSuccess,
}: {
  meditation: Meditation;
  currentMode: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedMode, setSelectedMode] = useState<'energizing' | 'calming'>(
    currentMode === 'energizing' ? 'calming' : 'energizing'
  );
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRedo() {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/redo-meditation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meditationId: meditation.id,
          mode: selectedMode,
          feedback: feedback.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details
          ? `${data.error}: ${data.details}`
          : data.error || 'Failed to redo meditation';
        throw new Error(errorMsg);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="mx-4 w-full max-w-2xl rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <h3 className="mb-4 text-xl font-bold text-white">Redo Meditation</h3>

        <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-500">
            ⚠️ This will archive the current version and generate a new script with audio removed.
            You'll need to regenerate the audio after approval.
          </p>
        </div>

        {/* Current Info */}
        <div className="mb-6">
          <p className="mb-2 text-sm text-neutral-400">
            <strong className="text-white">Current meditation:</strong> {meditation.title}
          </p>
          <p className="mb-2 text-sm text-neutral-400">
            <strong className="text-white">Current mode:</strong>{' '}
            <ModeBadge mode={currentMode} />
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-white">
            Select New Mode
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedMode('energizing')}
              className={`rounded-lg border p-4 text-left transition ${
                selectedMode === 'energizing'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-neutral-700 hover:bg-neutral-800'
              }`}
            >
              <div className="mb-2 text-2xl">⚡</div>
              <div className="font-medium text-white">Energizing</div>
              <div className="mt-1 text-xs text-neutral-400">
                High-energy, motivational, performance-focused
              </div>
            </button>
            <button
              onClick={() => setSelectedMode('calming')}
              className={`rounded-lg border p-4 text-left transition ${
                selectedMode === 'calming'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-neutral-700 hover:bg-neutral-800'
              }`}
            >
              <div className="mb-2 text-2xl">🌊</div>
              <div className="font-medium text-white">Calming</div>
              <div className="mt-1 text-xs text-neutral-400">
                Relaxing, contemplative, stress-reducing
              </div>
            </button>
          </div>
        </div>

        {/* Optional Feedback */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-white">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="E.g., 'Focus more on breathing', 'Add more pauses', 'Simplify language'..."
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRedo}
            disabled={isProcessing}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? 'Regenerating...' : `Redo as ${selectedMode}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  title,
  description,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="mx-4 w-full max-w-md rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
        <p className="mb-6 text-sm text-neutral-400">{description}</p>

        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-xs text-red-400">
            ⚠️ This action is permanent and cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}
