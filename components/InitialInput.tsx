'use client';

import { useState } from 'react';

interface InitialInputProps {
  onSubmit: (idea: string) => void;
}

export default function InitialInput({ onSubmit }: InitialInputProps) {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        What do you want to build?
      </h1>
      <p className="text-slate-600 mb-6">
        Describe your idea in a few words or sentences. We'll help you clarify it.
      </p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Example: A dashboard for tracking my fitness progress..."
          className="w-full h-32 p-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-slate-900"
        />
        
        <button
          type="submit"
          disabled={!idea.trim()}
          className="mt-4 w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
        >
          Start Building My Spec →
        </button>
      </form>
    </div>
  );
}