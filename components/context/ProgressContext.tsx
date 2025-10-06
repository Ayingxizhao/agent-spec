'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { 
  ProgressState, 
  ProgressContextType, 
  SWEPhase, 
  PhaseStatus, 
  QuestionProgress,
  SWE_PHASES,
  PhaseInfo
} from '../../types/progress';

// Initial state
const initialState: ProgressState = {
  phases: {
    problemDefinition: {
      status: 'pending',
      confidence: 0,
      questionsInPhase: ['q1'],
      completedQuestions: 0,
      totalQuestions: 1
    },
    solutionApproach: {
      status: 'pending',
      confidence: 0,
      questionsInPhase: ['q2_simple', 'q2_advanced'],
      completedQuestions: 0,
      totalQuestions: 1
    },
    scope: {
      status: 'pending',
      confidence: 0,
      questionsInPhase: ['q3_webapp', 'q3_mobile'],
      completedQuestions: 0,
      totalQuestions: 1
    },
    technical: {
      status: 'pending',
      confidence: 0,
      questionsInPhase: ['q4'],
      completedQuestions: 0,
      totalQuestions: 1
    },
    execution: {
      status: 'pending',
      confidence: 0,
      questionsInPhase: ['q5'],
      completedQuestions: 0,
      totalQuestions: 1
    }
  },
  questions: {},
  overallCompletion: 0,
  currentPhase: 'problemDefinition',
  currentQuestionId: null,
  specQuality: {
    completeness: 0,
    confidence: 0,
    clarity: 0
  },
  analytics: {
    startTime: Date.now(),
    totalTimeSpent: 0,
    questionsAnswered: 0,
    questionsSkipped: 0
  }
};

// Action types
type ProgressAction = 
  | { type: 'UPDATE_QUESTION_PROGRESS'; questionId: string; progress: Partial<QuestionProgress> }
  | { type: 'UPDATE_PHASE_STATUS'; phase: SWEPhase; status: PhaseStatus }
  | { type: 'SET_CURRENT_QUESTION'; questionId: string | null }
  | { type: 'INITIALIZE_FROM_PLAN'; questionPlan: any[]; analysis: any }
  | { type: 'UPDATE_ANALYTICS'; field: keyof ProgressState['analytics']; value: number }
  | { type: 'RECALCULATE_PROGRESS' };

// Helper function to get phase from template ID
const getPhaseFromTemplateId = (templateId: string): SWEPhase => {
  if (templateId === 'q1') return 'problemDefinition';
  if (templateId.startsWith('q2')) return 'solutionApproach';
  if (templateId.startsWith('q3')) return 'scope';
  if (templateId === 'q4') return 'technical';
  if (templateId === 'q5') return 'execution';
  return 'problemDefinition';
};

// Reducer
const progressReducer = (state: ProgressState, action: ProgressAction): ProgressState => {
  switch (action.type) {
    case 'INITIALIZE_FROM_PLAN': {
      const newQuestions: { [key: string]: QuestionProgress } = {};
      const phaseStats: { [key in SWEPhase]: { completed: number; total: number } } = {
        problemDefinition: { completed: 0, total: 0 },
        solutionApproach: { completed: 0, total: 0 },
        scope: { completed: 0, total: 0 },
        technical: { completed: 0, total: 0 },
        execution: { completed: 0, total: 0 }
      };

      // Initialize questions from plan
      action.questionPlan.forEach((planItem: any) => {
        const phase = getPhaseFromTemplateId(planItem.template_id);
        phaseStats[phase].total++;
        
        newQuestions[planItem.question_id] = {
          questionId: planItem.question_id,
          templateId: planItem.template_id,
          status: planItem.status === 'SKIP' ? 'skipped' : 'pending',
          phase,
          reasoning: planItem.reasoning,
          confidence: 0.8, // Default confidence
          inferredValue: planItem.inferred_value
        };

        if (planItem.status === 'SKIP') {
          phaseStats[phase].completed++;
        }
      });

      // Update phase info
      const newPhases = { ...state.phases };
      Object.entries(phaseStats).forEach(([phase, stats]) => {
        newPhases[phase as SWEPhase] = {
          ...newPhases[phase as SWEPhase],
          completedQuestions: stats.completed,
          totalQuestions: stats.total,
          status: stats.completed === stats.total ? 'complete' : 'pending'
        };
      });

      return {
        ...state,
        questions: newQuestions,
        phases: newPhases,
        analytics: {
          ...state.analytics,
          startTime: Date.now()
        }
      };
    }

    case 'UPDATE_QUESTION_PROGRESS': {
      const updatedQuestion = {
        ...state.questions[action.questionId],
        ...action.progress
      };
      
      const newQuestions = {
        ...state.questions,
        [action.questionId]: updatedQuestion
      };

      // Update phase progress
      const phase = updatedQuestion.phase;
      const phaseQuestions = Object.values(newQuestions).filter(q => q.phase === phase);
      const completedInPhase = phaseQuestions.filter(q => 
        q.status === 'completed' || q.status === 'skipped'
      ).length;

      const newPhases = {
        ...state.phases,
        [phase]: {
          ...state.phases[phase],
          completedQuestions: completedInPhase,
          status: completedInPhase === phaseQuestions.length ? 'complete' : 
                 phaseQuestions.some(q => q.status === 'active') ? 'active' : 'pending'
        }
      };

      return {
        ...state,
        questions: newQuestions,
        phases: newPhases
      };
    }

    case 'SET_CURRENT_QUESTION': {
      let newCurrentPhase = state.currentPhase;
      
      if (action.questionId && state.questions[action.questionId]) {
        newCurrentPhase = state.questions[action.questionId].phase;
        
        // Update question status to active
        const newQuestions = {
          ...state.questions,
          [action.questionId]: {
            ...state.questions[action.questionId],
            status: 'active' as const
          }
        };

        return {
          ...state,
          currentQuestionId: action.questionId,
          currentPhase: newCurrentPhase,
          questions: newQuestions
        };
      }

      return {
        ...state,
        currentQuestionId: action.questionId,
        currentPhase: newCurrentPhase
      };
    }

    case 'UPDATE_PHASE_STATUS': {
      return {
        ...state,
        phases: {
          ...state.phases,
          [action.phase]: {
            ...state.phases[action.phase],
            status: action.status
          }
        }
      };
    }

    case 'UPDATE_ANALYTICS': {
      return {
        ...state,
        analytics: {
          ...state.analytics,
          [action.field]: action.value
        }
      };
    }

    case 'RECALCULATE_PROGRESS': {
      const totalQuestions = Object.keys(state.questions).length;
      const completedQuestions = Object.values(state.questions).filter(q => 
        q.status === 'completed' || q.status === 'skipped'
      ).length;
      
      const overallCompletion = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;

      return {
        ...state,
        overallCompletion
      };
    }

    default:
      return state;
  }
};

// Context
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Provider component
export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  const updateQuestionProgress = useCallback((questionId: string, progress: Partial<QuestionProgress>) => {
    dispatch({ type: 'UPDATE_QUESTION_PROGRESS', questionId, progress });
    dispatch({ type: 'RECALCULATE_PROGRESS' });
  }, []);

  const updatePhaseStatus = useCallback((phase: SWEPhase, status: PhaseStatus) => {
    dispatch({ type: 'UPDATE_PHASE_STATUS', phase, status });
  }, []);

  const setCurrentQuestion = useCallback((questionId: string | null) => {
    dispatch({ type: 'SET_CURRENT_QUESTION', questionId });
  }, []);

  const calculateOverallProgress = useCallback(() => {
    return state.overallCompletion;
  }, [state.overallCompletion]);

  const getPhaseProgress = useCallback((phase: SWEPhase) => {
    const phaseInfo = state.phases[phase];
    if (phaseInfo.totalQuestions === 0) return 0;
    return (phaseInfo.completedQuestions / phaseInfo.totalQuestions) * 100;
  }, [state.phases]);

  const getCurrentPhase = useCallback(() => {
    return state.currentPhase;
  }, [state.currentPhase]);

  // Initialize from plan
  const initializeFromPlan = useCallback((questionPlan: any[], analysis: any) => {
    dispatch({ type: 'INITIALIZE_FROM_PLAN', questionPlan, analysis });
  }, []);

  const contextValue: ProgressContextType & { initializeFromPlan: (questionPlan: any[], analysis: any) => void } = {
    progressState: state,
    updateQuestionProgress,
    updatePhaseStatus,
    setCurrentQuestion,
    calculateOverallProgress,
    getPhaseProgress,
    getCurrentPhase,
    initializeFromPlan
  };

  return (
    <ProgressContext.Provider value={contextValue}>
      {children}
    </ProgressContext.Provider>
  );
};

// Hook
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};