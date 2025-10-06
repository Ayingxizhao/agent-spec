'use client';

import React, { useState } from 'react';
import { SWEPhaseFlow } from './SWEPhaseFlow';
import { QuestionStatusMap } from './QuestionStatusMap';
import { SpecCompletenessRing } from './SpecCompletenessRing';
import { useProgress } from '../context/ProgressContext';

interface ProgressSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'questions'>('overview');
  const { progressState } = useProgress();

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'phases' as const, label: 'Phases', icon: '🔄' },
    { id: 'questions' as const, label: 'Questions', icon: '❓' }
  ];

  if (isCollapsed) {
    return (
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Expand sidebar"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Collapsed progress indicator */}
        <div className="w-10 h-10 relative">
          <svg className="w-10 h-10 transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#3b82f6"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={`${progressState.overallCompletion * 1.005} 100.53`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">
              {Math.round(progressState.overallCompletion)}%
            </span>
          </div>
        </div>

        {/* Collapsed tab indicators */}
        <div className="space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={tab.label}
            >
              <span className="text-lg">{tab.icon}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Progress Tracker</h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Collapse sidebar"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        
        {/* Tab navigation */}
        <div className="flex mt-4 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'overview' && (
          <>
            <SpecCompletenessRing />
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h4 className="font-medium text-gray-900 mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Current Phase</div>
                  <div className="font-medium capitalize">
                    {progressState.currentPhase.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Questions Left</div>
                  <div className="font-medium">
                    {Object.values(progressState.questions).filter(q => 
                      q.status === 'pending' || q.status === 'active'
                    ).length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Auto-filled</div>
                  <div className="font-medium">
                    {Object.values(progressState.questions).filter(q => 
                      q.status === 'skipped'
                    ).length}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Completed</div>
                  <div className="font-medium">
                    {Object.values(progressState.questions).filter(q => 
                      q.status === 'completed'
                    ).length}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'phases' && <SWEPhaseFlow />}
        
        {activeTab === 'questions' && <QuestionStatusMap />}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500 text-center">
          <div>SWE Progress Tracking</div>
          <div className="mt-1">
            {Math.round(progressState.overallCompletion)}% Complete
          </div>
        </div>
      </div>
    </div>
  );
};