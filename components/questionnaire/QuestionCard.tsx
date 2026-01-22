'use client';

import { Question, QuestionOption } from '@/lib/questionnaire/questions';

interface QuestionCardProps {
  question: Question;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
}

export function QuestionCard({ question, value, onChange, error }: QuestionCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{question.question}</h2>
        {question.subtext && <p className="text-gray-400 text-lg">{question.subtext}</p>}
      </div>

      {/* Question Input */}
      <div className="space-y-3">
        {question.type === 'single-select' && question.options && (
          <SingleSelectOptions
            options={question.options}
            value={value as string}
            onChange={(v) => onChange(v)}
          />
        )}

        {question.type === 'multi-select' && question.options && (
          <MultiSelectOptions
            options={question.options}
            value={(value as string[]) || []}
            onChange={(v) => onChange(v)}
          />
        )}

        {question.type === 'text' && (
          <TextInput
            value={(value as string) || ''}
            onChange={(v) => onChange(v)}
            validation={question.validation}
            placeholder="Type your response here..."
          />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-4 text-red-400 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

interface SingleSelectOptionsProps {
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
}

function SingleSelectOptions({ options, value, onChange }: SingleSelectOptionsProps) {
  return (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
            value === option.value
              ? 'border-[#00ff88] bg-[#00ff88]/10'
              : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/50'
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Radio indicator */}
            <div
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                value === option.value ? 'border-[#00ff88]' : 'border-gray-600'
              }`}
            >
              {value === option.value && <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />}
            </div>

            <div>
              <span
                className={`font-medium block ${value === option.value ? 'text-white' : 'text-gray-200'}`}
              >
                {option.label}
              </span>
              {option.description && (
                <span className="text-sm text-gray-400 mt-1 block">{option.description}</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

interface MultiSelectOptionsProps {
  options: QuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

function MultiSelectOptions({ options, value, onChange }: MultiSelectOptionsProps) {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="grid gap-3">
      {options.map((option) => {
        const isSelected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggleOption(option.value)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              isSelected
                ? 'border-[#00ff88] bg-[#00ff88]/10'
                : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox indicator */}
              <div
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'border-[#00ff88] bg-[#00ff88]' : 'border-gray-600'
                }`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <div>
                <span className={`font-medium block ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-sm text-gray-400 mt-1 block">{option.description}</span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  validation?: {
    minLength?: number;
    maxLength?: number;
  };
  placeholder?: string;
}

function TextInput({ value, onChange, validation, placeholder }: TextInputProps) {
  const charCount = value.length;
  const maxLength = validation?.maxLength || 500;

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={4}
        className="w-full p-4 bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#00ff88] focus:outline-none focus:ring-0 transition-colors resize-none"
        style={{ fontSize: '16px' }} // Prevents iOS zoom on focus
      />
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-gray-500">
          {validation?.minLength && charCount < validation.minLength && (
            <>Minimum {validation.minLength} characters</>
          )}
        </span>
        <span className={`font-mono ${charCount >= maxLength ? 'text-red-400' : 'text-gray-500'}`}>
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  );
}
