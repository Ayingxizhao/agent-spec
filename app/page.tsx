'use client';

import { useState } from 'react';
import InitialInput from '@/components/InitialInput';
import QuestionCard from '@/components/QuestionCard';
import ProgressBar from '@/components/ProgressBar';
import { ProgressProvider, useProgress } from '@/components/context/ProgressContext';
import PlanSheet from '@/components/PlanSheet';

const AppContent: React.FC = () => {
  const {
    progressState,
    updateQuestionProgress,
    setCurrentQuestion,
    initializeFromPlan
  } = useProgress();

  const [questionPlan, setQuestionPlan] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userIdea, setUserIdea] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [estimatedTime, setEstimatedTime] = useState('');

  const generatePlan = async (idea: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: idea,
          requestType: 'generate_plan'
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Error generating plan:', data.error);
        return;
      }

      // Filter plan to only questions that need to be asked
      const questionsToAsk = data.questionPlan.filter((item: any) => 
        item.status === 'ASK' || item.status === 'CONFIRM'
      );

      setQuestionPlan(questionsToAsk);
      setAnalysis(data.analysis);
      setEstimatedTime(data.estimatedTime);
      setCurrentQuestionIndex(0);
      
      // Initialize progress context with the complete plan
      initializeFromPlan(data.questionPlan, data.analysis);
      
      // Set the first question as current
      if (questionsToAsk.length > 0) {
        setCurrentQuestion(questionsToAsk[0].question_id);
        updateQuestionProgress(questionsToAsk[0].question_id, {
          status: 'active',
          phase: questionsToAsk[0].progressMetadata.phase,
          reasoning: questionsToAsk[0].reasoning,
          confidence: questionsToAsk[0].progressMetadata.confidence
        });
      }
      
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSubmit = (idea: string) => {
    setUserIdea(idea);
    setIsStarted(true);
    generatePlan(idea);
  };

  const handleAnswer = (answer: any) => {
    const currentQuestion = questionPlan[currentQuestionIndex];
    
    // Update progress for current question
    updateQuestionProgress(currentQuestion.question_id, {
      status: 'completed',
      userAnswer: answer,
      timeSpent: Date.now() - progressState.analytics.startTime
    });
    
    // Move to next question or finish
    if (currentQuestionIndex < questionPlan.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQuestion = questionPlan[nextIndex];
      
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(nextQuestion.question_id);
      
      updateQuestionProgress(nextQuestion.question_id, {
        status: 'active'
      });
    } else {
      // All questions answered - show completion
      setCurrentQuestion(null);
      console.log('All questions answered!', {
        userIdea,
        analysis,
        progressState
      });
    }
  };

  const getCurrentQuestion = () => {
    if (questionPlan.length === 0 || currentQuestionIndex >= questionPlan.length) {
      return null;
    }
    return questionPlan[currentQuestionIndex];
  };

  const currentQuestion = getCurrentQuestion();
  const isComplete = isStarted && currentQuestionIndex >= questionPlan.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Initial Input Screen */}
      {!isStarted && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Agentic Spec Builder
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Transform your project idea into a comprehensive specification using AI-guided questions
            </p>
            <InitialInput onSubmit={handleInitialSubmit} />
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your idea and generating personalized questions...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
          </div>
        </div>
      )}

      {/* Main Plan Interface */}
      {isStarted && !isLoading && (
        <div className="fixed top-4 left-4 right-4 bottom-4 bg-white rounded-xl shadow-lg border">
          <div className="h-full flex">
            {/* Plan Sheet */}
            <div className="flex-1 relative">
              <PlanSheet />
            </div>
            
            {/* Question Panel */}
            <div className="w-96 border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Current Question</h2>
                <p className="text-sm text-gray-600">
                  {currentQuestionIndex + 1} of {questionPlan.length}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {currentQuestion ? (
                  <div className="p-4">
                    <QuestionCard 
                      question={currentQuestion.template} 
                      onAnswer={handleAnswer}
                      questionMeta={{
                        status: currentQuestion.status,
                        reasoning: currentQuestion.reasoning,
                        questionId: currentQuestion.question_id
                      }}
                    />
                  </div>
                ) : isComplete ? (
                  <div className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-green-600 mb-2">🎉 Complete!</h3>
                    <p className="text-gray-600 text-sm mb-4">All questions answered</p>
                    <button 
                      onClick={() => {
                        console.log('Generate final specification');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Generate Specification
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Loading questions...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  return (
    <ProgressProvider>
      <AppContent />
    </ProgressProvider>
  );
}