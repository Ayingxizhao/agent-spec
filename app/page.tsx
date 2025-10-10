'use client';

import { useState } from 'react';
import TaskInput from '@/components/TaskInput';
import CodeSuggestion from '@/components/CodeSuggestion';
import { CodingTask, CodeSuggestion as CodeSuggestionType, TaskHistory } from '@/types/coding';

export default function Home() {
  const [currentTask, setCurrentTask] = useState<CodingTask | null>(null);
  const [currentSuggestion, setCurrentSuggestion] = useState<CodeSuggestionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);

  const handleTaskSubmit = async (taskDescription: string) => {
    const task: CodingTask = {
      id: `task_${Date.now()}`,
      description: taskDescription,
      timestamp: Date.now(),
    };

    setCurrentTask(task);
    setIsLoading(true);
    setCurrentSuggestion(null);

    try {
      const response = await fetch('/api/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskDescription: task.description,
          taskId: task.id,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error generating code:', data.error);
        return;
      }

      setCurrentSuggestion(data.suggestion);
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!currentTask || !currentSuggestion) return;

    const history: TaskHistory = {
      task: currentTask,
      suggestion: currentSuggestion,
      accepted: true,
    };

    setTaskHistory([...taskHistory, history]);
    setCurrentTask(null);
    setCurrentSuggestion(null);
  };

  const handleCorrect = async (feedback: string, correctionType: string, correctedCode?: string) => {
    if (!currentTask || !currentSuggestion) return;

    const correction = {
      taskId: currentTask.id,
      originalCode: currentSuggestion.code,
      correctedCode,
      feedback,
      correctionType,
    };

    const history: TaskHistory = {
      task: currentTask,
      suggestion: currentSuggestion,
      correction,
      accepted: false,
    };

    try {
      const response = await fetch('/api/learn-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correction,
          taskHistory: history,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error learning from correction:', data.error);
        return;
      }

      console.log('Learned new preference:', data.learnedPreference);
      setTaskHistory([...taskHistory, history]);
      setCurrentTask(null);
      setCurrentSuggestion(null);
    } catch (error) {
      console.error('Failed to learn from correction:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Adaptive Coding Assistant
            </h1>
            <p className="text-lg text-gray-600">
              An AI that learns your coding preferences and patterns
            </p>
          </div>

          <div className="mb-8">
            <TaskInput onSubmit={handleTaskSubmit} isLoading={isLoading} />
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating code with learned preferences...</p>
              </div>
            </div>
          )}

          {currentSuggestion && !isLoading && (
            <div className="mb-8">
              <CodeSuggestion
                suggestion={currentSuggestion}
                onAccept={handleAccept}
                onCorrect={handleCorrect}
              />
            </div>
          )}

          {taskHistory.length > 0 && (
            <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Task History</h2>
              <div className="space-y-3">
                {taskHistory.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
                    <p className="text-sm text-gray-600">{item.task.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.accepted ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Accepted
                        </span>
                      ) : (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          Corrected
                        </span>
                      )}
                      {item.correction && (
                        <span className="text-xs text-gray-500">
                          {item.correction.feedback}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
