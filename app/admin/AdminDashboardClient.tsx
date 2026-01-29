'use client';

import { useState, useMemo, useRef, Dispatch, SetStateAction, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type TabType = 'questionnaires' | 'plans';

interface AdminDashboardClientProps {
  pendingQuestionnaires: any[];
  pendingPlans: any[];
  allPlans: any[];
}

export default function AdminDashboardClient({
  pendingQuestionnaires,
  pendingPlans,
  allPlans,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('questionnaires');

  // Filter plans by status - memoized to prevent recalculation on every render
  const approvedPlans = useMemo(
    () => allPlans.filter((p) => p.status === 'approved'),
    [allPlans]
  );

  const completedPlans = useMemo(
    () => allPlans.filter((p) => p.meditation_id && p.audio_url),
    [allPlans]
  );

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 border-b border-neutral-800">
        <nav className="-mb-px flex gap-8">
          <TabLink
            onClick={() => setActiveTab('questionnaires')}
            active={activeTab === 'questionnaires'}
          >
            Questionnaires
            {pendingQuestionnaires.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-neutral-950">
                {pendingQuestionnaires.length}
              </span>
            )}
          </TabLink>
          <TabLink
            onClick={() => setActiveTab('plans')}
            active={activeTab === 'plans'}
          >
            Meditation Plans
            {allPlans.length > 0 && (
              <span className="ml-2 rounded-full bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-300">
                {allPlans.length}
              </span>
            )}
          </TabLink>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'questionnaires' && (
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-white">
            Pending Questionnaires ({pendingQuestionnaires.length})
          </h2>
          {pendingQuestionnaires.length === 0 ? (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
              <p className="text-neutral-400">No pending questionnaires</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQuestionnaires.map((questionnaire) => (
                <QuestionnaireCard
                  key={questionnaire.id}
                  questionnaire={questionnaire}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'plans' && (
        <>
          {/* Pending Plans Section */}
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Pending Approval ({pendingPlans.length})
            </h2>
            {pendingPlans.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
                <p className="text-neutral-400">No pending meditation plans</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </div>
            )}
          </section>

          {/* Approved Plans Section */}
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Approved Plans ({approvedPlans.length})
            </h2>
            {approvedPlans.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
                <p className="text-neutral-400">No approved meditation plans</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} showAudioStatus />
                ))}
              </div>
            )}
          </section>

          {/* Completed Plans (with Audio) Section */}
          <section className="mb-12">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Completed (With Audio) ({completedPlans.length})
            </h2>
            {completedPlans.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-8 text-center">
                <p className="text-neutral-400">
                  No completed meditation plans with audio
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} showAudioStatus />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

function TabLink({
  onClick,
  active = false,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center border-b-2 py-4 text-sm font-medium ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-neutral-400 hover:border-neutral-600 hover:text-neutral-300'
      }`}
    >
      {children}
    </button>
  );
}

function QuestionnaireCard({ questionnaire }: { questionnaire: any }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const createdAt = new Date(questionnaire.created_at);
  const timeAgo = getTimeAgo(createdAt);

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/admin/delete-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaireId: questionnaire.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete questionnaire');
      }

      setShowDeleteModal(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
      alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-3">
              <h3 className="font-semibold text-white">
                {questionnaire.responses?.primaryGoal || 'New Questionnaire'}
              </h3>
              <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500">
                Pending
              </span>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex gap-2">
                <span className="text-neutral-500">Goal:</span>
                <span className="text-neutral-300">
                  {questionnaire.responses?.primaryGoal}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-500">Challenge:</span>
                <span className="text-neutral-300">
                  {questionnaire.responses?.currentChallenge}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-500">Duration:</span>
                <span className="text-neutral-300">
                  {questionnaire.responses?.sessionLength}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="text-neutral-500">Context:</span>
                <span className="text-neutral-300">
                  {questionnaire.responses?.performanceContext}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Submitted {timeAgo} • Tier {questionnaire.tier || 1}
            </p>
          </div>
          <div className="ml-4 flex flex-col gap-2">
            <Link
              href={`/admin/questionnaire/${questionnaire.id}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-primary/90"
            >
              Generate Plan
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          title="Delete Questionnaire"
          description="This questionnaire and any associated meditation plans will be permanently deleted. This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  );
}

function PlanCard({
  plan,
  showAudioStatus = false,
}: {
  plan: any;
  showAudioStatus?: boolean;
}) {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const createdAt = new Date(plan.created_at);
  const timeAgo = getTimeAgo(createdAt);

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/admin/delete-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete plan');
      }

      setShowDeleteModal(false);
      router.refresh();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <h3 className="font-semibold text-white">
              {plan.questionnaire_title || `Meditation Plan #${plan.id?.slice(0, 8)}`}
            </h3>
            <StatusBadge status={plan.status} />
            {showAudioStatus && plan.audio_url && (
              <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">
                ✓ Audio Generated
              </span>
            )}
          </div>
          <p className="mb-3 text-sm text-neutral-300">
            {plan.plan_data?.overallRationale || 'No rationale provided'}
          </p>
          <div className="flex flex-wrap gap-2">
            {plan.plan_data?.components?.map((comp: any, idx: number) => (
              <span
                key={idx}
                className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-300"
              >
                {comp.componentName}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Generated {timeAgo} • {plan.plan_data?.sessionStructure?.totalMinutes}{' '}
            min
          </p>
        </div>
        <div className="ml-4 flex flex-col gap-2">
          <Link
            href={`/admin/plan/${plan.id}`}
            className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-neutral-950 hover:bg-primary/90"
          >
            {plan.status === 'pending_approval' ? 'Review Plan' : 'View Plan'}
          </Link>
          {showAudioStatus && plan.meditation_id && (
            <Link
              href={`/admin/script/${plan.meditation_id}`}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-center text-sm font-medium text-white hover:bg-neutral-700"
            >
              View Script & Audio
            </Link>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Audio Player - shown for completed plans with audio */}
      {showAudioStatus && plan.audio_url && (
        <div className="mt-4 border-t border-neutral-800 pt-4">
          <PlanAudioPlayer
            audioUrl={plan.audio_url}
            audioRef={audioRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            duration={plan.audio_duration_seconds}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          title="Delete Meditation Plan"
          description="This meditation plan and any associated meditations/audio will be permanently deleted. This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}

function PlanAudioPlayer({
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
            className="flex-shrink-0 rounded-full bg-primary p-2 text-neutral-950 hover:bg-primary/90 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.75 4a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75V4.75A.75.75 0 0 0 7.25 4h-1.5zm6 0a.75.75 0 0 0-.75.75v10.5a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75V4.75a.75.75 0 0 0-.75-.75h-1.5z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>

          {/* Time Display */}
          <span className="flex-shrink-0 text-xs font-medium text-neutral-400 w-10">
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
          <span className="flex-shrink-0 text-xs font-medium text-neutral-400 w-10 text-right">
            {formatTime(totalDuration)}
          </span>

          {/* Download Button */}
          <a
            href={audioUrl}
            download
            className="flex-shrink-0 p-1 text-neutral-400 hover:text-primary transition-colors"
            aria-label="Download"
            title="Download audio"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
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

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending_approval: 'bg-yellow-500/10 text-yellow-500',
    approved: 'bg-green-500/10 text-green-500',
    regenerate_requested: 'bg-orange-500/10 text-orange-500',
  } as const;

  const labels = {
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    regenerate_requested: 'Regenerate Requested',
  } as const;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-neutral-700 text-neutral-300'}`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
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

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
