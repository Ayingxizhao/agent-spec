'use client';

import { useState } from 'react';
import { CodeSuggestion as CodeSuggestionType } from '@/types/coding';

interface CodeSuggestionProps {
  suggestion: CodeSuggestionType;
  onAccept: () => void;
  onCorrect: (feedback: string, correctionType: string, correctedCode?: string) => void;
}

export default function CodeSuggestion({ suggestion, onAccept, onCorrect }: CodeSuggestionProps) {
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [correctedCode, setCorrectedCode] = useState('');
  const [correctionType, setCorrectionType] = useState<'tech_stack' | 'pattern' | 'style' | 'security' | 'other'>('other');

  const handleCorrect = () => {
    if (feedback.trim()) {
      onCorrect(feedback, correctionType, correctedCode.trim() || undefined);
      setShowCorrectionForm(false);
      setFeedback('');
      setCorrectedCode('');
      setCorrectionType('other');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {suggestion.explanation && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">{suggestion.explanation}</p>
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase">{suggestion.language}</span>
          <button
            onClick={() => navigator.clipboard.writeText(suggestion.code)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Copy
          </button>
        </div>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <code>{suggestion.code}</code>
        </pre>
      </div>

      {!showCorrectionForm ? (
        <div className="flex gap-3">
          <button
            onClick={onAccept}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => setShowCorrectionForm(true)}
            className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Correct
          </button>
        </div>
      ) : (
        <div className="space-y-3 border-t pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correction Type
            </label>
            <select
              value={correctionType}
              onChange={(e) => setCorrectionType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tech_stack">Tech Stack</option>
              <option value="pattern">Code Pattern</option>
              <option value="style">Code Style</option>
              <option value="security">Security</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What's wrong? (describe the issue)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., We use Fastify, not Express"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Corrected Code (optional)
            </label>
            <textarea
              value={correctedCode}
              onChange={(e) => setCorrectedCode(e.target.value)}
              placeholder="Paste the corrected version here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCorrect}
              disabled={!feedback.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Submit Correction
            </button>
            <button
              onClick={() => setShowCorrectionForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
