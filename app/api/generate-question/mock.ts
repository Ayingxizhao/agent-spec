// Mock data for testing without API costs

export const mockQuestionPlan = {
  analysis: {
    user_input_summary: "Learning project: React to-do app",
    confidence_level: "high",
    inferred_aspects: {
      goal: "learning",
      goal_confidence: 0.98,
      type: "webapp",
      type_confidence: 0.95,
      features: ["cms"],
      features_confidence: 0.80,
      technical: ["simple"],
      technical_confidence: 0.85,
      priority: "learning",
      priority_confidence: 0.95
    }
  },
  questionPlan: [
    {
      question_id: "q1",
      status: "SKIP",
      reasoning: "Explicitly stated 'learn React' - clearly a learning project",
      template_id: "q1",
      pre_selected_options: [],
      inferred_value: "learning",
      adapted_text: null,
      template: {
        id: "goal",
        text: "What's your primary goal for this project?",
        category: "problem_definition",
        multiSelect: false,
        required: 1,
        options: [
          {
            id: "learning",
            label: "Learning/school project",
            description: "Building this to learn new skills or for coursework",
            example: "Example: Class assignment or learning a new framework",
            implications: "Will focus on educational value and clear documentation"
          }
        ],
        preSelected: []
      },
      progressMetadata: {
        phase: "problemDefinition",
        sequenceNumber: 1,
        estimatedTimeMinutes: 0,
        complexity: "simple",
        confidence: 0.98
      }
    },
    {
      question_id: "q2",
      status: "SKIP",
      reasoning: "To-do app implies web application",
      template_id: "q2_simple",
      pre_selected_options: [],
      inferred_value: "webapp",
      adapted_text: null,
      template: {
        id: "type_simple",
        text: "What type of application do you want to build?",
        category: "solution_approach",
        multiSelect: false,
        required: 1,
        options: [
          {
            id: "webapp",
            label: "Web application",
            description: "Interactive app that runs in the browser",
            example: "Example: To-do app, calculator, note-taking tool",
            implications: "More interactive, can store user data"
          }
        ],
        preSelected: []
      },
      progressMetadata: {
        phase: "solutionApproach",
        sequenceNumber: 2,
        estimatedTimeMinutes: 0,
        complexity: "simple",
        confidence: 0.95
      }
    },
    {
      question_id: "q3",
      status: "CONFIRM",
      reasoning: "To-do app needs content management, but might want other features",
      template_id: "q3_webapp",
      pre_selected_options: ["cms"],
      inferred_value: null,
      adapted_text: "For your to-do app, which features do you need? (Select 1-3)",
      template: {
        id: "features_webapp",
        text: "For your to-do app, which features do you need? (Select 1-3)",
        category: "scope",
        multiSelect: true,
        minSelect: 1,
        maxSelect: 3,
        options: [
          {
            id: "auth",
            label: "User accounts & profiles",
            description: "Users can sign up, log in, and manage their profile",
            example: "Example: Save preferences, personal data, settings",
            implications: "Need authentication system and user database"
          },
          {
            id: "cms",
            label: "Content management",
            description: "Create, edit, organize, and publish content",
            example: "Example: Blog posts, documents, product listings",
            implications: "Need rich text editor and content storage"
          },
          {
            id: "search",
            label: "Search & filtering",
            description: "Find and filter through data",
            example: "Example: Full-text search, faceted filtering",
            implications: "May need search indexing for large datasets"
          },
          {
            id: "notifications",
            label: "Notifications",
            description: "Email or in-app alerts for users",
            example: "Example: Task reminders, activity updates",
            implications: "Email service or notification system needed"
          }
        ],
        preSelected: ["cms"]
      },
      progressMetadata: {
        phase: "scope",
        sequenceNumber: 3,
        estimatedTimeMinutes: 2,
        complexity: "medium",
        confidence: 0.80
      }
    },
    {
      question_id: "q4",
      status: "SKIP",
      reasoning: "Simple project mentioned, minimal tech stack",
      template_id: "q4",
      pre_selected_options: [],
      inferred_value: "simple",
      adapted_text: null,
      template: {
        id: "technical_needs",
        text: "Any special technical requirements?",
        category: "technical",
        multiSelect: true,
        minSelect: 0,
        maxSelect: 4,
        options: [
          {
            id: "simple",
            label: "Keep it simple",
            description: "Minimal technical complexity",
            example: "Example: No backend, static hosting",
            implications: "Focus on core functionality only"
          }
        ],
        preSelected: []
      },
      progressMetadata: {
        phase: "technical",
        sequenceNumber: 4,
        estimatedTimeMinutes: 0,
        complexity: "simple",
        confidence: 0.85
      }
    },
    {
      question_id: "q5",
      status: "SKIP",
      reasoning: "Learning is the priority",
      template_id: "q5",
      pre_selected_options: [],
      inferred_value: "learning",
      adapted_text: null,
      template: {
        id: "priority",
        text: "What's your main priority for this project?",
        category: "execution",
        multiSelect: false,
        required: 1,
        options: [
          {
            id: "learning",
            label: "Learning experience",
            description: "Explore and learn new technologies",
            example: "Example: Try new framework, experiment with tools",
            implications: "Expect learning curve and exploration time"
          }
        ],
        preSelected: []
      },
      progressMetadata: {
        phase: "execution",
        sequenceNumber: 5,
        estimatedTimeMinutes: 0,
        complexity: "simple",
        confidence: 0.95
      }
    }
  ],
  totalQuestions: 1,
  estimatedTime: "30 seconds",
  progressMetadata: {
    phaseStatistics: {
      problemDefinition: { total: 1, toAsk: 0, skipped: 1 },
      solutionApproach: { total: 1, toAsk: 0, skipped: 1 },
      scope: { total: 1, toAsk: 1, skipped: 0 },
      technical: { total: 1, toAsk: 0, skipped: 1 },
      execution: { total: 1, toAsk: 0, skipped: 1 }
    },
    overallConfidence: "high",
    totalEstimatedMinutes: 2,
    questionsToAsk: 1,
    questionsSkipped: 4
  }
};
