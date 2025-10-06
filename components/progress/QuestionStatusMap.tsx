'use client';

import React, { useState } from 'react';
import { QuestionProgress, SWE_PHASES } from '../../types/progress';
import { useProgress } from '../context/ProgressContext';

interface QuestionCardProps {
  question: QuestionProgress;
  isActive: boolean;
  onClick: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, isActive, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const getStatusIcon = () => {
    switch (question.status) {
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'active':
        return (
          <div className="w-4 h-4 border-2 border-blue-500 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full m-0.5"></div>
          </div>
        );
      case 'skipped':
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
          </svg>
        );
      default:
        return (
          <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
        );
    }
  };

  const getCardStyle = () => {
    switch (question.status) {
      case 'completed':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'active':
        return 'border-blue-300 bg-blue-50 ring-2 ring-blue-200 hover:bg-blue-100';
      case 'skipped':
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
      default:
        return 'border-gray-200 bg-white hover:bg-gray-50';
    }
  };

  const getPhaseInfo = () => {
    return SWE_PHASES.find(p => p.id === question.phase);
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${getCardStyle()} ${
          isActive ? 'scale-105 shadow-md' : 'hover:scale-102'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {getStatusIcon()}
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {question.questionId}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 truncate">
              {phaseInfo?.name || question.phase}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {question.status === 'skipped' ? 'Auto-filled' : 
               question.status === 'completed' ? 'Answered' :
               question.status === 'active' ? 'In progress' : 'Pending'}
            </div>
          </div>
          
          {/* Confidence indicator */}
          {question.confidence > 0 && (
            <div className="ml-2">
              <div className={`text-xs px-2 py-1 rounded-full ${
                question.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                question.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {Math.round(question.confidence * 100)}%
              </div>
            </div>
          )}
        </div>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
          <div className="font-medium mb-1">{phaseInfo?.name}</div>
          <div className="text-gray-300 mb-2">{question.reasoning}</div>
          
          {question.status === 'skipped' && question.inferredValue && (
            <div className="border-t border-gray-700 pt-2">
              <div className="font-medium">Auto-filled value:</div>
              <div className="text-gray-300">{question.inferredValue}</div>
            </div>
          )}
          
          {question.userAnswer && (
            <div className="border-t border-gray-700 pt-2">
              <div className="font-medium">Your answer:</div>
              <div className="text-gray-300">
                {typeof question.userAnswer === 'object' ? 
                  JSON.stringify(question.userAnswer, null, 2) : 
                  question.userAnswer}
              </div>
            </div>
          )}
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export const QuestionStatusMap: React.FC = () => {
  const { progressState, setCurrentQuestion } = useProgress();
  const questions = Object.values(progressState.questions);
  
  // Group questions by phase
  const questionsByPhase = SWE_PHASES.map(phase => ({
    phase,
    questions: questions.filter(q => q.phase === phase.id)
  })).filter(group => group.questions.length > 0);

  const handleQuestionClick = (questionId: string) => {
    // Could implement navigation to specific question
    setCurrentQuestion(questionId);
    console.log('Navigate to question:', questionId);
  };

  const getPhaseProgress = (phaseQuestions: QuestionProgress[]) => {
    const completed = phaseQuestions.filter(q => 
      q.status === 'completed' || q.status === 'skipped'
    ).length;
    return phaseQuestions.length > 0 ? (completed / phaseQuestions.length) * 100 : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Question Progress</h3>
        <p className="text-sm text-gray-600">Track individual question status</p>
      </div>
      
      <div className="p-4 space-y-6">
        {questionsByPhase.map(({ phase, questions: phaseQuestions }) => (
          <div key={phase.id}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{phase.icon}</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{phase.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 bg-${phase.color}-500`}
                      style={{ width: `${getPhaseProgress(phaseQuestions)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(getPhaseProgress(phaseQuestions))}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 ml-11">
              {phaseQuestions.map(question => (
                <QuestionCard
                  key={question.questionId}
                  question={question}
                  isActive={progressState.currentQuestionId === question.questionId}
                  onClick={() => handleQuestionClick(question.questionId)}
                />
              ))}
            </div>
          </div>
        ))}
        
        {questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-sm">Questions will appear here once you start</div>
          </div>
        )}
      </div>
    </div>
  );
};