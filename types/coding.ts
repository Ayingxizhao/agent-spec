export interface LearnedPreference {
  id: string;
  type: 'tech_stack' | 'pattern' | 'style' | 'security' | 'other';
  description: string;
  example?: string;
  timestamp: number;
  taskContext?: string;
}

export interface CodingTask {
  id: string;
  description: string;
  timestamp: number;
}

export interface CodeSuggestion {
  taskId: string;
  code: string;
  language: string;
  explanation?: string;
  appliedPreferences: string[]; // IDs of preferences used
}

export interface CorrectionFeedback {
  taskId: string;
  originalCode: string;
  correctedCode?: string;
  feedback: string;
  correctionType: 'tech_stack' | 'pattern' | 'style' | 'security' | 'other';
}

export interface TaskHistory {
  task: CodingTask;
  suggestion: CodeSuggestion;
  correction?: CorrectionFeedback;
  accepted: boolean;
}
