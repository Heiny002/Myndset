'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UNIVERSAL_QUESTIONS,
  getTier1Questions,
  getTier2Questions,
  type UserType,
} from '@/lib/questionnaire/questions';
import type { Question, QuestionnaireResponses } from '@/lib/questionnaire/questions';
import { ProgressBar } from '@/components/questionnaire/ProgressBar';
import { QuestionCard } from '@/components/questionnaire/QuestionCard';
import { NavigationButtons } from '@/components/questionnaire/NavigationButtons';

interface TestMeditationClientProps {
  userId: string;
  userEmail: string;
}

export default function TestMeditationClient({ userId, userEmail }: TestMeditationClientProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<QuestionnaireResponses>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionnaireLevel, setQuestionnaireLevel] = useState<1 | 2>(2);
  const [userType, setUserType] = useState<UserType | null>(null);

  // Get selected user type from first question response
  useEffect(() => {
    const arenaResponse = responses['performance_arena'];
    if (arenaResponse && typeof arenaResponse === 'string') {
      setUserType(arenaResponse as UserType);
    }
  }, [responses]);

  // Build questions dynamically based on user type selection
  const getAllQuestions = (): Question[] => {
    if (!userType) {
      // Only show universal questions until user type is selected
      return UNIVERSAL_QUESTIONS;
    }

    const tier1 = getTier1Questions(userType);
    if (questionnaireLevel === 1) {
      return tier1;
    }
    return [...tier1, ...getTier2Questions()];
  };

  const allQuestions = getAllQuestions();
  const currentQuestion = allQuestions[currentQuestionIndex];

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [questionId]: '',
    }));
  };

  const validateCurrentQuestion = (): boolean => {
    const question = currentQuestion;
    const answer = responses[question.id];

    if (question.required && !answer) {
      setErrors((prev) => ({
        ...prev,
        [question.id]: 'This question is required',
      }));
      return false;
    }

    if (question.type === 'text' && typeof answer === 'string') {
      if (question.validation?.minLength && answer.length < question.validation.minLength) {
        setErrors((prev) => ({
          ...prev,
          [question.id]: `Minimum ${question.validation?.minLength} characters required`,
        }));
        return false;
      }
      if (question.validation?.maxLength && answer.length > question.validation.maxLength) {
        setErrors((prev) => ({
          ...prev,
          [question.id]: `Maximum ${question.validation?.maxLength} characters allowed`,
        }));
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (currentQuestionIndex < allQuestions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/create-test-meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          tier: questionnaireLevel,
          responses,
          autoApprove: false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.details
          ? `${error.error}: ${error.details}`
          : error.error || 'Failed to create test meditation';
        throw new Error(errorMsg);
      }

      const data = await response.json();
      // Redirect to the script detail page for approval/editing
      router.push(`/admin/script/${data.meditationId}`);
    } catch (error) {
      console.error('Error creating test meditation:', error);
      alert(error instanceof Error ? error.message : 'Failed to create test meditation');
      setIsSubmitting(false);
    }
  };

  // Calculate question counts for display
  const tier1Count = userType ? getTier1Questions(userType).length : UNIVERSAL_QUESTIONS.length + 5;
  const tier2Count = tier1Count + getTier2Questions().length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold text-white">
            Admin
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{userEmail}</span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">
              Test Mode
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {currentQuestionIndex === 0 && (
          <div className="mb-8 bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Questionnaire Level</h2>
            <p className="text-gray-400 text-sm mb-4">
              Choose how extensive you want the questionnaire to be:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setQuestionnaireLevel(1)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  questionnaireLevel === 1
                    ? 'border-[#00ff88] bg-[#00ff88]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-white mb-1">Tier 1</div>
                <div className="text-sm text-gray-400">~{tier1Count} questions</div>
                <div className="text-xs text-gray-500 mt-2">Core essentials - fast activation</div>
              </button>
              <button
                onClick={() => setQuestionnaireLevel(2)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  questionnaireLevel === 2
                    ? 'border-[#00ff88] bg-[#00ff88]/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-white mb-1">Tier 2</div>
                <div className="text-sm text-gray-400">~{tier2Count} questions</div>
                <div className="text-xs text-gray-500 mt-2">Deep personalization</div>
              </button>
            </div>
          </div>
        )}

        <div className="mb-8">
          <ProgressBar current={currentQuestionIndex + 1} total={allQuestions.length} />
        </div>

        <QuestionCard
          question={currentQuestion}
          value={responses[currentQuestion.id]}
          onChange={(value) => handleAnswer(currentQuestion.id, value)}
          error={errors[currentQuestion.id]}
        />

        <NavigationButtons
          currentStep={currentQuestionIndex + 1}
          totalSteps={allQuestions.length}
          canProceed={true}
          isSubmitting={isSubmitting}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-purple-300 mb-1">Admin Test Mode</h3>
              <p className="text-sm text-gray-400">
                This test meditation will generate the script for your review. You can then approve/edit the script and set the voice before audio generation. No email verification required.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
