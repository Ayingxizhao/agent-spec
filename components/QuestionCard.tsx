'use client';

import { useState } from 'react';

interface Option {
  id: string;
  label: string;
  description: string;
  example: string;
  implications?: string;
}

interface QuestionCardProps {
  question: {
    text: string;
    options: Option[];
    multiSelect?: boolean;
    preSelected?: string[];
    category?: string;
  };
  onAnswer: (answer: any) => void;
  questionMeta?: {
    status: string;
    reasoning: string;
    questionId: string;
  };
}

export default function QuestionCard({ question, onAnswer, questionMeta }: QuestionCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(question.preSelected || []);
  const isMultiSelect = question.multiSelect;
  const isConfirm = questionMeta?.status === 'CONFIRM';

  const handleSingleSelect = (option: Option) => {
    onAnswer({
      questionId: questionMeta?.questionId,
      question: question.text,
      selectedOption: option,
      multiSelect: false
    });
  };

  const handleMultiSelect = (option: Option) => {
    let newSelection;
    if (selectedOptions.includes(option.id)) {
      newSelection = selectedOptions.filter(id => id !== option.id);
    } else {
      newSelection = [...selectedOptions, option.id];
    }
    setSelectedOptions(newSelection);
  };

  const handleSubmitMultiSelect = () => {
    const selectedOptionObjects = question.options.filter(opt => 
      selectedOptions.includes(opt.id)
    );
    
    onAnswer({
      questionId: questionMeta?.questionId,
      question: question.text,
      selectedOptions: selectedOptionObjects,
      multiSelect: true
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 mt-6">
      {isConfirm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Confirming:</span> {questionMeta?.reasoning}
          </p>
        </div>
      )}
      
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {question.text}
      </h2>
      
      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = isMultiSelect ? selectedOptions.includes(option.id) : false;
          const isPreSelected = question.preSelected?.includes(option.id);
          
          return (
            <button
              key={option.id}
              onClick={() => isMultiSelect ? handleMultiSelect(option) : handleSingleSelect(option)}
              className={`w-full text-left p-4 border-2 rounded-lg transition group ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : isPreSelected 
                    ? 'border-indigo-300 bg-indigo-25' 
                    : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-start">
                {isMultiSelect && (
                  <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <div className={`font-semibold ${
                    isSelected || isPreSelected ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'
                  }`}>
                    {option.label}
                    {isPreSelected && (
                      <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        suggested
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    {option.description}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    {option.example}
                  </div>
                  {option.implications && (
                    <div className="text-xs text-blue-600 mt-1 italic">
                      → {option.implications}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isMultiSelect && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-sm text-slate-600">
            Selected: {selectedOptions.length} option{selectedOptions.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={handleSubmitMultiSelect}
            disabled={selectedOptions.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-700 transition"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}