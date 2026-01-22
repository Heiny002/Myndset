'use client';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isSubmitting?: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  canProceed,
  isSubmitting = false,
  onPrevious,
  onNext,
}: NavigationButtonsProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between items-center gap-4 mt-8">
      {/* Previous Button */}
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
          isFirstStep || isSubmitting
            ? 'text-gray-600 cursor-not-allowed'
            : 'text-gray-300 hover:text-white hover:bg-gray-800'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Next/Submit Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed || isSubmitting}
        className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
          canProceed && !isSubmitting
            ? 'bg-[#00ff88] text-black hover:bg-[#00cc6a] hover:scale-105'
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
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
            <span>Processing...</span>
          </>
        ) : isLastStep ? (
          <>
            <span>Get My Meditation</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </>
        ) : (
          <>
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
}
