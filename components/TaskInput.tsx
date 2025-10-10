'use client';

import { useState } from 'react';

interface TaskInputProps {
  onSubmit: (task: string) => void;
  isLoading: boolean;
}

export default function TaskInput({ onSubmit, isLoading }: TaskInputProps) {
  const [task, setTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim()) {
      onSubmit(task.trim());
      setTask('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6">
        <label
          htmlFor="task"
          className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
        >
          What code do you need?
        </label>
        <textarea
          id="task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g., Write API endpoint for user authentication"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
          rows={3}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !task.trim()}
          className="mt-4 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Generating...' : 'Generate Code'}
        </button>
      </div>
    </form>
  );
}
