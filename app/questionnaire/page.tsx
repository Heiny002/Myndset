'use client';

export const dynamic = 'force-dynamic';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProgressBar, QuestionCard, NavigationButtons } from '@/components/questionnaire';
import { TIER_1_QUESTIONS, QuestionnaireResponses } from '@/lib/questionnaire/questions';
import { createClient } from '@/lib/supabase/client';

export default function QuestionnairePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState<QuestionnaireResponses>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = TIER_1_QUESTIONS;
  const currentQuestion = questions[currentStep - 1];
  const totalSteps = questions.length;

  // Get current response value
  const currentValue = responses[currentQuestion.id] || '';

  // Validate current question
  const validateCurrentQuestion = useCallback((): boolean => {
    const question = currentQuestion;
    const value = responses[question.id];

    // Required field check
    if (question.required) {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        setErrors({ [question.id]: 'This question is required' });
        return false;
      }
    }

    // Text field validation
    if (question.type === 'text' && question.validation) {
      const textValue = value as string;
      if (question.validation.minLength && textValue.length < question.validation.minLength) {
        setErrors({
          [question.id]: `Please enter at least ${question.validation.minLength} characters`,
        });
        return false;
      }
    }

    setErrors({});
    return true;
  }, [currentQuestion, responses]);

  // Check if current question has a valid response
  const canProceed = useCallback((): boolean => {
    const question = currentQuestion;
    const value = responses[question.id];

    if (!value || (Array.isArray(value) && value.length === 0)) {
      return false;
    }

    if (question.type === 'text' && question.validation?.minLength) {
      return (value as string).length >= question.validation.minLength;
    }

    return true;
  }, [currentQuestion, responses]);

  // Handle response change
  const handleResponseChange = (value: string | string[]) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    // Clear error when user provides a response
    if (errors[currentQuestion.id]) {
      setErrors({});
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  // Navigate to next question or submit
  const handleNext = async () => {
    if (!validateCurrentQuestion()) {
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit the questionnaire
      await handleSubmit();
    }
  };

  // Submit questionnaire to Supabase
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Store responses in sessionStorage and redirect to auth
        sessionStorage.setItem('pendingQuestionnaire', JSON.stringify(responses));
        router.push('/auth/signup?redirect=/questionnaire/complete');
        return;
      }

      // Save questionnaire responses to database
      const { error } = await supabase.from('questionnaire_responses').insert({
        user_id: user.id,
        tier: 1,
        responses: responses,
        completed_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error saving questionnaire:', error);
        setErrors({ submit: 'Failed to save your responses. Please try again.' });
        setIsSubmitting(false);
        return;
      }

      // Redirect to success page
      router.push('/questionnaire/complete');
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Myndset
          </Link>
          <span className="text-sm text-gray-500">Free Personalized Meditation</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
          {/* Progress Bar */}
          <div className="mb-8">
            <ProgressBar current={currentStep} total={totalSteps} />
          </div>

          {/* Question Card */}
          <div className="flex-1 flex items-start">
            <QuestionCard
              question={currentQuestion}
              value={currentValue}
              onChange={handleResponseChange}
              error={errors[currentQuestion.id]}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Navigation */}
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={totalSteps}
            canProceed={canProceed()}
            isSubmitting={isSubmitting}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          Your responses are private and used only to personalize your meditation.
        </div>
      </footer>
    </div>
  );
}
