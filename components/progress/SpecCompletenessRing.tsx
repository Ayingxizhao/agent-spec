'use client';

import React from 'react';
import { useProgress } from '../context/ProgressContext';

interface ProgressRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  progress, 
  size, 
  strokeWidth, 
  color, 
  backgroundColor = '#e5e7eb' 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${progress * circumference / 100} ${circumference}`;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
};

interface QualityMeterProps {
  label: string;
  value: number;
  color: string;
  icon: string;
}

const QualityMeter: React.FC<QualityMeterProps> = ({ label, value, color, icon }) => (
  <div className="flex items-center gap-3">
    <span className="text-lg">{icon}</span>
    <div className="flex-1">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  </div>
);

export const SpecCompletenessRing: React.FC = () => {
  const { progressState, calculateOverallProgress } = useProgress();
  const overallProgress = calculateOverallProgress();
  const { specQuality, analytics } = progressState;

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981'; // green-500
    if (progress >= 60) return '#f59e0b'; // amber-500
    if (progress >= 40) return '#ef4444'; // red-500
    return '#6b7280'; // gray-500
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 90) return 'Excellent';
    if (progress >= 80) return 'Good';
    if (progress >= 60) return 'Fair';
    if (progress >= 40) return 'Poor';
    return 'Starting';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${Math.round(remainingSeconds)}s`;
  };

  const timeSpent = (Date.now() - analytics.startTime) / 1000;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Spec Completeness</h3>
        
        {/* Main progress ring */}
        <div className="relative inline-block">
          <ProgressRing
            progress={overallProgress}
            size={120}
            strokeWidth={8}
            color={getProgressColor(overallProgress)}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(overallProgress)}%
            </div>
            <div className="text-xs text-gray-500">
              {getProgressLabel(overallProgress)}
            </div>
          </div>
        </div>
      </div>

      {/* Quality metrics */}
      <div className="space-y-4 mb-6">
        <QualityMeter
          label="Completeness"
          value={specQuality.completeness}
          color="bg-blue-500"
          icon="📋"
        />
        <QualityMeter
          label="Confidence"
          value={specQuality.confidence}
          color="bg-green-500"
          icon="🎯"
        />
        <QualityMeter
          label="Clarity"
          value={specQuality.clarity}
          color="bg-purple-500"
          icon="💡"
        />
      </div>

      {/* Statistics */}
      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl font-semibold text-gray-900">
              {analytics.questionsAnswered}
            </div>
            <div className="text-xs text-gray-500">Answered</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-gray-900">
              {analytics.questionsSkipped}
            </div>
            <div className="text-xs text-gray-500">Auto-filled</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-600">
            Time spent: <span className="font-medium">{formatTime(timeSpent)}</span>
          </div>
        </div>
      </div>

      {/* Progress insights */}
      {overallProgress > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            {overallProgress < 25 && (
              <span>🚀 Just getting started! Keep going to build your spec.</span>
            )}
            {overallProgress >= 25 && overallProgress < 50 && (
              <span>⚡ Good momentum! You're making solid progress.</span>
            )}
            {overallProgress >= 50 && overallProgress < 75 && (
              <span>🎯 More than halfway there! Your spec is taking shape.</span>
            )}
            {overallProgress >= 75 && overallProgress < 95 && (
              <span>🔥 Almost done! Just a few more details needed.</span>
            )}
            {overallProgress >= 95 && (
              <span>🎉 Excellent! Your spec is comprehensive and ready.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};