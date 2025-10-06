'use client';

import React from 'react';
import { SWE_PHASES, SWEPhase, PhaseStatus } from '../../types/progress';
import { useProgress } from '../context/ProgressContext';

interface PhaseNodeProps {
  phase: typeof SWE_PHASES[0];
  status: PhaseStatus;
  progress: number;
  isActive: boolean;
  onClick: () => void;
}

const PhaseNode: React.FC<PhaseNodeProps> = ({ phase, status, progress, isActive, onClick }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'complete': return 'bg-green-500 border-green-600';
      case 'active': return 'bg-blue-500 border-blue-600';
      case 'skipped': return 'bg-gray-400 border-gray-500';
      default: return 'bg-gray-200 border-gray-300';
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'complete':
      case 'active': return 'text-white';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center group">
      <button
        onClick={onClick}
        className={`relative w-16 h-16 rounded-full border-3 transition-all duration-300 
          ${getStatusColor()} ${isActive ? 'ring-4 ring-blue-200 scale-110' : 'hover:scale-105'}
          flex items-center justify-center text-2xl ${getTextColor()}`}
      >
        {status === 'complete' ? (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : status === 'skipped' ? (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <span>{phase.icon}</span>
        )}
        
        {/* Progress ring for active phases */}
        {status === 'active' && progress > 0 && (
          <svg className="absolute inset-0 w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray={`${progress * 1.76} 176`}
              className="text-blue-300"
            />
          </svg>
        )}
      </button>
      
      <div className="mt-2 text-center">
        <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-700'}`}>
          {phase.name}
        </div>
        <div className="text-xs text-gray-500 max-w-20">
          {phase.description}
        </div>
        {progress > 0 && status !== 'complete' && (
          <div className="text-xs text-blue-600 font-medium">
            {Math.round(progress)}%
          </div>
        )}
      </div>
    </div>
  );
};

const ConnectionLine: React.FC<{ completed: boolean }> = ({ completed }) => (
  <div className="flex-1 h-1 mx-4 rounded-full transition-colors duration-500">
    <div className={`h-full rounded-full ${completed ? 'bg-green-400' : 'bg-gray-300'}`} />
  </div>
);

export const SWEPhaseFlow: React.FC = () => {
  const { progressState, getPhaseProgress, getCurrentPhase } = useProgress();
  const currentPhase = getCurrentPhase();

  const getPhaseStatus = (phaseId: SWEPhase): PhaseStatus => {
    return progressState.phases[phaseId].status;
  };

  const isPhaseActive = (phaseId: SWEPhase): boolean => {
    return currentPhase === phaseId;
  };

  const isConnectionCompleted = (fromIndex: number): boolean => {
    const fromPhase = SWE_PHASES[fromIndex];
    return getPhaseStatus(fromPhase.id) === 'complete';
  };

  const handlePhaseClick = (phaseId: SWEPhase) => {
    // Could implement navigation to specific phase
    console.log('Navigate to phase:', phaseId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">SWE Development Process</h3>
        <p className="text-sm text-gray-600">Track progress through software engineering phases</p>
      </div>
      
      <div className="flex items-center justify-between">
        {SWE_PHASES.map((phase, index) => (
          <React.Fragment key={phase.id}>
            <PhaseNode
              phase={phase}
              status={getPhaseStatus(phase.id)}
              progress={getPhaseProgress(phase.id)}
              isActive={isPhaseActive(phase.id)}
              onClick={() => handlePhaseClick(phase.id)}
            />
            
            {index < SWE_PHASES.length - 1 && (
              <ConnectionLine completed={isConnectionCompleted(index)} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Phase legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            <span className="text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Active</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">Skipped</span>
          </div>
        </div>
      </div>
    </div>
  );
};