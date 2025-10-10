'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Pattern {
  name?: string;
  description?: string;
  rationale?: string;
  changeNarrative?: string;
  threatMitigated?: string;
  controlLayer?: string;
  dependencies?: string[] | string | null;
  operationalNotes?: string;
  evidenceFromDiff?: string;
}

export default function PatternTestPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showModified, setShowModified] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  const runTest = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const response = await fetch('/api/test-pattern');
      const data = await response.json();

      if (data.error) {
        console.error('Error running test:', data.error);
        return;
      }

      setResults(data);
    } catch (error) {
      console.error('Failed to run test:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Pattern Extraction Test</h2>
          <p className="text-sm text-gray-600">Test if GPT-4o-mini can extract security patterns from code diffs</p>
        </div>
        <button
          onClick={runTest}
          disabled={isRunning}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? 'Running Test...' : 'Run Test'}
        </button>
      </div>

      {isRunning && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Computing diff and extracting patterns...</p>
          </div>
        </div>
      )}

      {results && !isRunning && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Test Results</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-purple-600 font-medium">Lines Added:</span>
                <span className="ml-2 text-purple-900">{results.diff.addedLines}</span>
              </div>
              <div>
                <span className="text-purple-600 font-medium">Lines Removed:</span>
                <span className="ml-2 text-purple-900">{results.diff.removedLines}</span>
              </div>
              <div>
                <span className="text-purple-600 font-medium">Patterns Found:</span>
                <span className="ml-2 text-purple-900">{results.extractedPatterns.length}</span>
              </div>
            </div>
          </div>

          {/* Extracted Patterns */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Extracted Patterns</h3>
            <div className="space-y-3">
              {results.extractedPatterns.map((pattern: Pattern, index: number) => {
                const dependenciesArray = Array.isArray(pattern.dependencies)
                  ? pattern.dependencies
                  : pattern.dependencies
                  ? [pattern.dependencies]
                  : [];
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-semibold text-gray-900">{pattern.name ?? `Pattern ${index + 1}`}</h4>

                        {pattern.changeNarrative ? (
                          <p className="text-sm text-gray-700">{pattern.changeNarrative}</p>
                        ) : (
                          pattern.description && <p className="text-sm text-gray-700">{pattern.description}</p>
                        )}

                        <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-600">
                          {(pattern.threatMitigated || pattern.rationale) && (
                            <div>
                              <span className="font-semibold text-gray-800">Threat Mitigated:</span>{' '}
                              {pattern.threatMitigated ?? pattern.rationale}
                            </div>
                          )}
                          {pattern.controlLayer && (
                            <div>
                              <span className="font-semibold text-gray-800">Control Layer:</span>{' '}
                              {pattern.controlLayer}
                            </div>
                          )}
                        </div>

                        {dependenciesArray.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-800">Dependencies:</span>{' '}
                            {dependenciesArray.join(', ')}
                          </div>
                        )}

                        {pattern.operationalNotes && (
                          <div className="text-xs text-gray-600">
                            <span className="font-semibold text-gray-800">Operational Notes:</span>{' '}
                            {pattern.operationalNotes}
                          </div>
                        )}

                        {pattern.evidenceFromDiff && (
                          <div className="text-xs text-purple-700 bg-purple-100/60 border border-purple-200 rounded px-3 py-2">
                            <span className="font-semibold text-purple-900">Evidence:</span>{' '}
                            {pattern.evidenceFromDiff}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Code Sections (Collapsible) */}
          <div className="space-y-2">
            {/* Original Code */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 flex items-center justify-between transition-colors"
              >
                <span className="font-medium text-gray-700">Original Code (Basic)</span>
                {showOriginal ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showOriginal && (
                <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm">
                  <code>{results.originalCode}</code>
                </pre>
              )}
            </div>

            {/* Modified Code */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowModified(!showModified)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 flex items-center justify-between transition-colors"
              >
                <span className="font-medium text-gray-700">Modified Code (Secure)</span>
                {showModified ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showModified && (
                <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm">
                  <code>{results.modifiedCode}</code>
                </pre>
              )}
            </div>

            {/* Diff */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowDiff(!showDiff)}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 flex items-center justify-between transition-colors"
              >
                <span className="font-medium text-gray-700">Unified Diff</span>
                {showDiff ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showDiff && (
                <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm">
                  <code>{results.diff.unified}</code>
                </pre>
              )}
            </div>
          </div>

          {/* Raw GPT Response (for debugging) */}
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">Raw GPT Response (debug)</summary>
            <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
              {results.rawGPTResponse}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
