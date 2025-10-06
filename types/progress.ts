export type PhaseStatus = 'pending' | 'active' | 'complete' | 'skipped';
export type QuestionStatus = 'skipped' | 'pending' | 'active' | 'completed';

export interface PhaseInfo {
  status: PhaseStatus;
  confidence: number;
  questionsInPhase: string[];
  completedQuestions: number;
  totalQuestions: number;
}

export interface QuestionProgress {
  questionId: string;
  templateId: string;
  status: QuestionStatus;
  phase: SWEPhase;
  reasoning: string;
  confidence: number;
  userAnswer?: any;
  inferredValue?: any;
  timeSpent?: number;
}

export interface ProgressState {
  phases: {
    problemDefinition: PhaseInfo;
    solutionApproach: PhaseInfo;
    scope: PhaseInfo;
    technical: PhaseInfo;
    execution: PhaseInfo;
  };
  questions: { [questionId: string]: QuestionProgress };
  overallCompletion: number;
  currentPhase: SWEPhase;
  currentQuestionId: string | null;
  specQuality: {
    completeness: number;
    confidence: number;
    clarity: number;
  };
  analytics: {
    startTime: number;
    totalTimeSpent: number;
    questionsAnswered: number;
    questionsSkipped: number;
  };
}

export type SWEPhase = 
  | 'problemDefinition' 
  | 'solutionApproach' 
  | 'scope' 
  | 'technical' 
  | 'execution';

export interface PhaseConfig {
  id: SWEPhase;
  name: string;
  description: string;
  icon: string;
  color: string;
  questionIds: string[];
}

export const SWE_PHASES: PhaseConfig[] = [
  {
    id: 'problemDefinition',
    name: 'Problem Definition',
    description: 'What problem are we solving?',
    icon: '🎯',
    color: 'red',
    questionIds: ['q1']
  },
  {
    id: 'solutionApproach',
    name: 'Solution Approach',
    description: 'How will we solve it?',
    icon: '⚡',
    color: 'orange',
    questionIds: ['q2_simple', 'q2_advanced']
  },
  {
    id: 'scope',
    name: 'Scope Definition',
    description: 'What features do we need?',
    icon: '📋',
    color: 'blue',
    questionIds: ['q3_webapp', 'q3_mobile']
  },
  {
    id: 'technical',
    name: 'Technical Requirements',
    description: 'What tech do we need?',
    icon: '⚙️',
    color: 'green',
    questionIds: ['q4']
  },
  {
    id: 'execution',
    name: 'Execution Strategy',
    description: 'How do we prioritize?',
    icon: '🚀',
    color: 'purple',
    questionIds: ['q5']
  }
];

export interface ProgressContextType {
  progressState: ProgressState;
  updateQuestionProgress: (questionId: string, progress: Partial<QuestionProgress>) => void;
  updatePhaseStatus: (phase: SWEPhase, status: PhaseStatus) => void;
  setCurrentQuestion: (questionId: string | null) => void;
  calculateOverallProgress: () => number;
  getPhaseProgress: (phase: SWEPhase) => number;
  getCurrentPhase: () => SWEPhase;
  initializeFromPlan: (questionPlan: any[], analysis: any) => void;
}