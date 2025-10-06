export const questionTemplates: { [key: string]: any } = {
  q1: {
    id: 'goal',
    text: 'What\'s your primary goal for this project?',
    category: 'problem_definition',
    multiSelect: false,
    required: 1,
    options: [
      {
        id: 'learning',
        label: 'Learning/school project',
        description: 'Building this to learn new skills or for coursework',
        example: 'Example: Class assignment or learning a new framework',
        implications: 'Will focus on educational value and clear documentation'
      },
      {
        id: 'personal',
        label: 'Personal tool for myself',
        description: 'Solving a problem I have personally',
        example: 'Example: Track my expenses, manage my recipes',
        implications: 'Can optimize for your specific workflow'
      },
      {
        id: 'portfolio',
        label: 'Professional portfolio piece',
        description: 'Showcasing skills to potential employers',
        example: 'Example: Demonstrating full-stack capabilities',
        implications: 'Should emphasize best practices and polish'
      },
      {
        id: 'product',
        label: 'Product/startup to launch',
        description: 'Building something for others to use',
        example: 'Example: SaaS product, mobile app for customers',
        implications: 'Need to consider scalability and user experience'
      }
    ]
  },

  q2_simple: {
    id: 'type_simple',
    text: 'What type of application do you want to build?',
    category: 'solution_approach',
    multiSelect: false,
    required: 1,
    appliesWhen: ['learning', 'personal'],
    options: [
      {
        id: 'website',
        label: 'Simple website/landing page',
        description: 'Static or simple interactive site',
        example: 'Example: Personal blog, product landing page',
        implications: 'Quick to build, easy to deploy and host'
      },
      {
        id: 'webapp',
        label: 'Web application',
        description: 'Interactive app that runs in the browser',
        example: 'Example: To-do app, calculator, note-taking tool',
        implications: 'More interactive, can store user data'
      },
      {
        id: 'mobile',
        label: 'Mobile app concept',
        description: 'App designed for phones/tablets',
        example: 'Example: Fitness tracker, habit builder',
        implications: 'Need to choose iOS, Android, or both'
      },
      {
        id: 'cli',
        label: 'Command-line tool',
        description: 'Terminal-based application',
        example: 'Example: Build automation, file processor',
        implications: 'For developers and power users'
      }
    ]
  },

  q2_advanced: {
    id: 'type_advanced',
    text: 'What type of application are you building?',
    category: 'solution_approach',
    multiSelect: false,
    required: 1,
    appliesWhen: ['portfolio', 'product'],
    options: [
      {
        id: 'saas',
        label: 'Web application (SaaS)',
        description: 'Full-featured web app with user accounts',
        example: 'Example: Project management tool, CRM, analytics dashboard',
        implications: 'Needs authentication, database, hosting infrastructure'
      },
      {
        id: 'mobile',
        label: 'Mobile app',
        description: 'Native or cross-platform mobile application',
        example: 'Example: Social app, productivity tool, game',
        implications: 'App store deployment, platform-specific features'
      },
      {
        id: 'api',
        label: 'API/Backend service',
        description: 'Headless backend that other apps consume',
        example: 'Example: Data API, authentication service, webhook processor',
        implications: 'Focus on performance, documentation, versioning'
      },
      {
        id: 'desktop',
        label: 'Desktop application',
        description: 'Native application for Windows/Mac/Linux',
        example: 'Example: Creative tool, system utility, IDE',
        implications: 'Platform-specific builds and distributions'
      }
    ]
  },

  q3_webapp: {
    id: 'features_webapp',
    text: 'Which features are important for your web app? (Select 1-3)',
    category: 'scope',
    multiSelect: true,
    minSelect: 1,
    maxSelect: 3,
    appliesWhen: ['webapp', 'saas'],
    options: [
      {
        id: 'auth',
        label: 'User accounts & profiles',
        description: 'Users can sign up, log in, and manage their profile',
        example: 'Example: Save preferences, personal data, settings',
        implications: 'Need authentication system and user database'
      },
      {
        id: 'viz',
        label: 'Data visualization',
        description: 'Charts, graphs, and visual analytics',
        example: 'Example: Line charts for trends, pie charts for breakdowns',
        implications: 'Will use charting libraries like Recharts or Chart.js'
      },
      {
        id: 'realtime',
        label: 'Real-time collaboration',
        description: 'Multiple users working together simultaneously',
        example: 'Example: Live cursor positions, instant updates',
        implications: 'Requires WebSocket infrastructure'
      },
      {
        id: 'cms',
        label: 'Content management',
        description: 'Create, edit, organize, and publish content',
        example: 'Example: Blog posts, documents, product listings',
        implications: 'Need rich text editor and content storage'
      },
      {
        id: 'search',
        label: 'Search & filtering',
        description: 'Find and filter through data',
        example: 'Example: Full-text search, faceted filtering',
        implications: 'May need search indexing for large datasets'
      },
      {
        id: 'files',
        label: 'File upload & storage',
        description: 'Users can upload documents, images, videos',
        example: 'Example: Profile photos, document attachments',
        implications: 'Need cloud storage solution (S3, Cloudinary)'
      },
      {
        id: 'notifications',
        label: 'Notifications',
        description: 'Email or in-app alerts for users',
        example: 'Example: Task reminders, activity updates',
        implications: 'Email service or notification system needed'
      },
      {
        id: 'social',
        label: 'Social features',
        description: 'Comments, likes, following, sharing',
        example: 'Example: Comment threads, activity feeds',
        implications: 'Additional database complexity for interactions'
      }
    ]
  },

  q3_mobile: {
    id: 'features_mobile',
    text: 'Which features are important for your mobile app? (Select 1-3)',
    category: 'scope',
    multiSelect: true,
    minSelect: 1,
    maxSelect: 3,
    appliesWhen: ['mobile'],
    options: [
      {
        id: 'auth',
        label: 'User authentication',
        description: 'Sign up and login functionality',
        example: 'Example: Email/password, social login, biometric',
        implications: 'Need secure auth flow and backend'
      },
      {
        id: 'offline',
        label: 'Offline functionality',
        description: 'Works without internet connection',
        example: 'Example: Cache data, sync when online',
        implications: 'Local storage and sync strategy needed'
      },
      {
        id: 'push',
        label: 'Push notifications',
        description: 'Send alerts to users\' devices',
        example: 'Example: Reminders, updates, messages',
        implications: 'Push notification service setup'
      },
      {
        id: 'camera',
        label: 'Camera/photo integration',
        description: 'Take photos or select from gallery',
        example: 'Example: Profile pictures, document scanning',
        implications: 'Need camera permissions and image handling'
      },
      {
        id: 'location',
        label: 'Location services',
        description: 'GPS and location-based features',
        example: 'Example: Maps, nearby locations, check-ins',
        implications: 'Location permissions and map integration'
      },
      {
        id: 'payments',
        label: 'In-app purchases',
        description: 'Accept payments within the app',
        example: 'Example: Premium features, subscriptions',
        implications: 'Payment gateway integration'
      },
      {
        id: 'social',
        label: 'Social sharing',
        description: 'Share content to social platforms',
        example: 'Example: Share achievements, invite friends',
        implications: 'Social media API integration'
      }
    ]
  },

  q4: {
    id: 'technical_needs',
    text: 'Any special technical requirements? (Select what applies, or none)',
    category: 'technical',
    multiSelect: true,
    minSelect: 0,
    maxSelect: 4,
    options: [
      {
        id: 'database',
        label: 'Database/data persistence',
        description: 'Store data permanently between sessions',
        example: 'Example: User data, content, application state',
        implications: 'Need to set up and manage a database'
      },
      {
        id: 'integrations',
        label: 'Third-party integrations',
        description: 'Connect to external APIs or services',
        example: 'Example: Stripe payments, Google Maps, email service',
        implications: 'API keys and integration setup required'
      },
      {
        id: 'auth_tech',
        label: 'User authentication',
        description: 'Secure login and user management system',
        example: 'Example: JWT tokens, OAuth, session management',
        implications: 'Security considerations and auth flow'
      },
      {
        id: 'realtime_tech',
        label: 'Real-time updates',
        description: 'Live data synchronization across clients',
        example: 'Example: WebSockets, live notifications',
        implications: 'WebSocket server or service like Pusher'
      },
      {
        id: 'files_tech',
        label: 'File/media handling',
        description: 'Upload, store, and serve files',
        example: 'Example: Images, videos, documents',
        implications: 'Cloud storage solution needed'
      },
      {
        id: 'offline',
        label: 'Offline capability',
        description: 'App works without internet connection',
        example: 'Example: Service workers, local caching',
        implications: 'Sync strategy and conflict resolution'
      },
      {
        id: 'performance',
        label: 'High performance/scale',
        description: 'Handle many users or large data volumes',
        example: 'Example: Thousands of concurrent users',
        implications: 'Optimization and infrastructure planning critical'
      },
      {
        id: 'simple',
        label: 'Keep it simple',
        description: 'Minimal technical complexity',
        example: 'Example: No backend, static hosting',
        implications: 'Focus on core functionality only'
      }
    ]
  },

  q5: {
    id: 'priority',
    text: 'What\'s your main priority for this project?',
    category: 'execution',
    multiSelect: false,
    required: 1,
    options: [
      {
        id: 'speed',
        label: 'Speed to completion',
        description: 'Get it working quickly, iterate later',
        example: 'Example: MVP in 2 weeks, refine based on feedback',
        implications: 'May accept technical debt and simpler solutions'
      },
      {
        id: 'quality',
        label: 'Code quality & polish',
        description: 'Take time to build it properly',
        example: 'Example: Comprehensive tests, clean architecture',
        implications: 'Longer timeline but more maintainable'
      },
      {
        id: 'learning',
        label: 'Learning experience',
        description: 'Explore and learn new technologies',
        example: 'Example: Try new framework, experiment with tools',
        implications: 'Expect learning curve and exploration time'
      },
      {
        id: 'simplicity',
        label: 'Simplicity & clarity',
        description: 'Minimal features, maximum clarity',
        example: 'Example: One core feature done extremely well',
        implications: 'Ruthlessly cut scope, focus on essentials'
      }
    ]
  }
};