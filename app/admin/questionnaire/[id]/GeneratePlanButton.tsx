'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GeneratePlanButton({
  questionnaireId,
}: {
  questionnaireId: string;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGeneratePlan() {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionnaireId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      // Redirect to plan review page
      router.push(`/admin/plan/${data.planId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsGenerating(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleGeneratePlan}
        disabled={isGenerating}
        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-neutral-950 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? 'Generating Plan...' : 'Generate Meditation Plan'}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
