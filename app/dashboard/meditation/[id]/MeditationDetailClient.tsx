'use client';

import { useState } from 'react';
import AudioPlayer from '@/components/AudioPlayer';
import ScriptRemixer from '@/components/ScriptRemixer';

interface Meditation {
  id: string;
  title: string;
  description: string | null;
  script_text: string | null;
  audio_url: string | null;
  audio_duration_seconds: number | null;
  created_at: string;
  techniques: any;
}

interface MeditationDetailClientProps {
  meditation: Meditation;
}

export default function MeditationDetailClient({ meditation: initialMeditation }: MeditationDetailClientProps) {
  const [meditation, setMeditation] = useState(initialMeditation);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showRemixer, setShowRemixer] = useState(false);

  const metadata = (meditation.techniques as any) || {};
  const hasAudio = !!meditation.audio_url;
  const hasScript = !!meditation.script_text;

  const handleRemixComplete = (newScript: string, audioUrl: string | null) => {
    setMeditation({
      ...meditation,
      script_text: newScript,
      audio_url: audioUrl || meditation.audio_url,
    });
    setShowRemixer(false);
  };

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{meditation.title}</h1>
          {meditation.description && (
            <p className="text-lg text-neutral-400">{meditation.description}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {new Date(meditation.created_at).toLocaleDateString()}
            </div>
            {meditation.audio_duration_seconds && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {Math.round(meditation.audio_duration_seconds / 60)} minutes
              </div>
            )}
            {metadata.audio_voice_name && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
                {metadata.audio_voice_name}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap gap-4">
          {hasAudio && (
            <button
              onClick={() => setShowAudioPlayer(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-neutral-950 font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Play Meditation
            </button>
          )}
          {hasScript && (
            <button
              onClick={() => setShowRemixer(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-800 text-white font-semibold rounded-lg hover:bg-neutral-700 transition-colors border-2 border-neutral-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Remix Script
            </button>
          )}
        </div>

        {/* Meditation Script */}
        {hasScript && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Meditation Script
            </h2>
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
              <div className="prose prose-invert max-w-none">
                <div className="text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {meditation.script_text}
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-neutral-800 flex items-center justify-between text-sm text-neutral-500">
                <div>
                  Word count: {meditation.script_text?.split(' ').length || 0}
                </div>
                {metadata.lastRemix && (
                  <div className="text-right">
                    <div className="text-primary">Last remixed:</div>
                    <div>{new Date(metadata.lastRemix.date).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Meditation Details */}
        {metadata.selectedComponents && metadata.selectedComponents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Meditation Techniques</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {metadata.selectedComponents.map((component: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg"
                >
                  <div className="font-semibold text-white mb-1">{component.name}</div>
                  {component.description && (
                    <div className="text-sm text-neutral-400">{component.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for No Script */}
        {!hasScript && (
          <div className="text-center p-12 bg-neutral-900/50 border border-neutral-800 rounded-xl">
            <svg
              className="w-16 h-16 mx-auto text-neutral-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">Script Not Yet Generated</h3>
            <p className="text-neutral-400">
              Your meditation script is being prepared. You'll be notified when it's ready.
            </p>
          </div>
        )}
      </main>

      {/* Audio Player Modal */}
      {showAudioPlayer && hasAudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl">
            <AudioPlayer
              src={meditation.audio_url!}
              title={meditation.title}
              onClose={() => setShowAudioPlayer(false)}
            />
          </div>
        </div>
      )}

      {/* Remix Modal */}
      {showRemixer && hasScript && (
        <ScriptRemixer
          meditationId={meditation.id}
          scriptText={meditation.script_text!}
          onRemixComplete={handleRemixComplete}
          onClose={() => setShowRemixer(false)}
        />
      )}
    </>
  );
}
