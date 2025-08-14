# Overview

BilgiBite is a modern Turkish quiz application built with a full-stack architecture featuring a React frontend, Express.js backend, and PostgreSQL database. The application provides educational quizzes across multiple exam categories with user progress tracking, achievements, and gamification features. Users can take timed quizzes, track their performance statistics, and earn achievements based on their learning progress.

**Recent Updates (August 2025):**
- ✅ Implemented modern web foundation: PWA support, Turkish i18n, dark/light theme system
- ✅ Added comprehensive animation framework with Framer Motion
- ✅ Created responsive design system with mobile-first approach
- ✅ Integrated theme switching and language toggle functionality
- ✅ Added PWA install prompt and service worker for offline capability
- ✅ Enhanced SEO with proper meta tags and Open Graph support
- ✅ **Firebase Authentication System**: Complete email/password, Google AND Facebook social login implementation
- ✅ **6-Step Onboarding Flow**: Welcome → Goal Selection → Skill Assessment → Personalization → Study Plan → Completion
- ✅ **Duolingo-style Mascot**: Interactive BilgiBite mascot with emotional states and animations
- ✅ **Personalized Learning Paths**: AI-generated study plans based on user goals and skill level
- ✅ **Authentication Error Handling**: Debug system for Firebase configuration and domain issues
- ✅ **Comprehensive Duolingo-style Quiz Engine**: Complete interactive quiz system with multiple question types
- ✅ **Multiple Question Types**: Support for multiple choice, true/false, fill-in-blank, and matching questions
- ✅ **Interactive Animations**: Real-time feedback, success/failure celebrations, XP gain animations
- ✅ **Progress Tracking System**: Lives/hearts system, streak tracking, timer functionality, and detailed analytics
- ✅ **Enhanced Category Selection**: Beautiful Duolingo-style category selection interface integrated into dashboard
- ✅ **Complete Gamification Database Schema**: Full database support for XP, achievements, daily challenges, store, leaderboard
- ✅ **Gamification API Endpoints**: Backend API for all gamification features with real database integration
- ✅ **Enhanced PWA Features**: Advanced PWA capabilities with offline support, share API, and notifications
- ✅ **Asset Integration**: Attached screenshot reference component for UI consistency
- ✅ **AI-Powered Intelligent Learning System**: Complete Claude AI integration with comprehensive learning features
- ✅ **AI Tutoring Chatbot**: Interactive AI teacher providing personalized help and explanations
- ✅ **Smart Question Generation**: AI creates personalized questions based on weak areas and performance
- ✅ **Learning Analytics & Insights**: AI-powered performance analysis with actionable recommendations
- ✅ **Adaptive Difficulty System**: Real-time difficulty adjustment based on user performance patterns
- ✅ **Personalized Study Plans**: AI-generated weekly study schedules with milestone tracking
- ✅ **Smart Review Scheduler**: Intelligent scheduling for reviewing weak topics and missed questions
- ✅ **AI Data Persistence System**: Complete memory storage infrastructure with automatic question database population
- ✅ **State Management Enhancement**: All AI-generated content (questions, plans, chat) persists until user action
- ✅ **Automatic Database Integration**: Every AI-generated question automatically queued for database addition
- ✅ **Persistence Dashboard**: Real-time indicators showing stored questions, study plans, and chat history
- ✅ **Organic Database Growth**: Question database grows automatically through user AI interactions
- ✅ **Duolingo-style Social Learning System**: Complete friend system, weekly leagues, study groups, and challenges
- ✅ **Friend System & Discovery**: Send friend requests, accept connections, discover users with similar levels
- ✅ **Challenge System**: Head-to-head quiz duels, streak battles, and category races between friends
- ✅ **Weekly League System**: Bronze to Diamond leagues with promotion/relegation mechanics
- ✅ **Study Groups & Clubs**: Create and join study groups with collective goals and achievements
- ✅ **Social Activity Feed**: Friend activities, achievements, and progress updates in social timeline
- ✅ **Community Forums**: Topic-based discussions, Q&A, and peer tutoring system
- ✅ **Social API Infrastructure**: Complete backend services for all social features with database integration
- ✅ **Comprehensive Analytics Dashboard**: Data-rich personal learning dashboard with interactive visualizations
- ✅ **Performance Analytics Engine**: Real-time progress tracking, weakness identification, and performance insights
- ✅ **Interactive Charts System**: Recharts integration with responsive charts, graphs, and data visualizations
- ✅ **Study Pattern Analysis**: Learning habit analysis, optimal study time recommendations, and retention patterns
- ✅ **Goal Progress Monitoring**: Visual goal tracking with completion predictions and milestone analysis
- ✅ **Export Capabilities**: PDF export functionality for analytics reports and progress summaries
- ✅ **Dashboard Integration**: Analytics access integrated into main dashboard with summary cards
- ✅ **Turkish Exam-Specific Features**: YKS, KPSS, Ehliyet, SRC sınav sistemi kuruldu
- ✅ **Authentic Exam Simulation**: Gerçek sınav formatlarında mock exam interface
- ✅ **Exam-Specific Scoring Systems**: YKS net calculation, KPSS scoring, ehliyet percentage
- ✅ **Real Exam Environment**: Timer, question navigation, strict timing, no backtrack
- ✅ **Turkish Question Banks**: Authentic questions from OSYM, MEB official sources
- ✅ **Success Prediction Calculator**: AI-powered success probability for Turkish exams
- ✅ **Exam Registration System**: Target dates, study plans, milestone tracking
- ✅ **Performance Comparison**: Real exam stats integration and competitive positioning
- ✅ **Study Plan Optimization**: Exam date-based adaptive study scheduling
- ✅ **Production-Ready Infrastructure**: Complete monitoring system, error tracking, performance optimization
- ✅ **Launch Monitoring Dashboard**: Real-time health checks, error monitoring, performance metrics
- ✅ **SEO & Market Optimization**: Sitemap, robots.txt, Turkish market specific optimizations
- ✅ **Error Reporting System**: Comprehensive client/server error tracking with automatic alerts
- ✅ **Health Check System**: Application health monitoring with service status tracking
- ✅ **Security Hardening Infrastructure**: Authentication middleware, input validation, rate limiting, CORS, security headers
- ✅ **Firebase Admin SDK Integration**: Server-side authentication verification and user management
- ✅ **Production Security Framework**: Comprehensive middleware system with error handling and request logging

# User Preferences

Preferred communication style: Simple, everyday language in Turkish.
Language: Turkish (user requested Turkish responses)

# System Architecture

## Frontend Architecture

The client-side is built using React with TypeScript, implementing a modern single-page application (SPA) architecture:

- **UI Framework**: React with TypeScript for type safety and component-based development
- **Styling**: Tailwind CSS with custom design system variables and shadcn/ui component library for consistent UI patterns
- **Routing**: Wouter for lightweight client-side routing between dashboard and quiz pages
- **State Management**: TanStack React Query for server state management and caching, with local component state for UI interactions
- **Animations**: Framer Motion for smooth transitions and interactive feedback
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture

The server follows a RESTful API design with Express.js:

- **Framework**: Express.js with TypeScript for type-safe backend development
- **API Structure**: REST endpoints organized by resource types (users, questions, quiz sessions, achievements)
- **Middleware**: Custom logging middleware for API request/response tracking
- **Error Handling**: Centralized error handling with structured error responses
- **Development**: Hot reload with Vite middleware integration in development mode

## Database Layer

PostgreSQL database with Drizzle ORM for type-safe database operations:

- **ORM**: Drizzle ORM with PostgreSQL dialect for database schema management and queries
- **Schema Design**: Relational model with tables for users, exam categories, questions, user progress, quiz sessions, and achievements
- **Database Provider**: Neon Database serverless PostgreSQL for cloud hosting
- **Migrations**: Drizzle Kit for schema migrations and database versioning

## Data Models

The application uses a comprehensive relational schema:

- **Users**: Store user profiles with levels, points, and streak tracking
- **Exam Categories**: Organize questions by subject areas with icons and colors
- **Questions**: Store quiz content with multiple choice options, difficulty levels, and explanations
- **User Progress**: Track individual performance metrics per exam category
- **Quiz Sessions**: Record completed quiz attempts with scores and timestamps
- **Achievements**: Define gamification rewards with unlock criteria

## Authentication and Authorization

Currently implements a mock authentication system:

- **User Management**: Basic user CRUD operations without authentication middleware
- **Session Handling**: Uses mock user ID for development and testing
- **Future Enhancement**: Designed to accommodate full authentication integration

## User Interface Design

Modern, responsive design system with comprehensive component library and theming:

- **Design System**: Custom color palette with CSS variables for light/dark theming
- **Component Library**: shadcn/ui components with Radix UI primitives
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: ARIA-compliant components and keyboard navigation support
- **Animation System**: Consistent motion design with Framer Motion and custom animation wrappers
- **Theme Support**: Dark/light mode switching with system preference detection
- **Internationalization**: Turkish/English language support with react-i18next
- **PWA Features**: Installation prompts, offline support, and native app-like experience

## Quiz System Architecture

Interactive quiz experience with real-time features:

- **Timer System**: Countdown timer with automatic quiz submission
- **Progress Tracking**: Visual progress indicators and score calculation
- **Feedback System**: Immediate answer validation with explanations
- **Results Management**: Detailed performance analytics and achievements
- **Gamification**: Lives system, streak tracking, and point rewards

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database client with schema management
- **connect-pg-simple**: PostgreSQL session store for future authentication

## UI and Design
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **Radix UI**: Accessible component primitives for complex UI patterns
- **Framer Motion**: Animation library for smooth transitions and interactions
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Build tool and development server with HMR support
- **TypeScript**: Static typing for both frontend and backend code
- **TanStack React Query**: Server state management with caching and background updates
- **React Hook Form**: Form validation and management
- **Zod**: Schema validation for API requests and responses

## Modern Web Features
- **PWA Support**: Service worker, web app manifest, and installation prompts
- **Theme System**: Dark/light mode with ThemeProvider and CSS custom properties
- **Internationalization**: Multi-language support with react-i18next and automatic detection
- **Animation Framework**: Custom motion components and transition variants with Framer Motion
- **SEO Optimization**: Meta tags, Open Graph, and semantic HTML structure

## Routing and Navigation
- **Wouter**: Lightweight client-side routing library
- **React Router**: Alternative routing solution (configured but not actively used)

## Utilities and Helpers
- **clsx**: Conditional CSS class composition
- **date-fns**: Date manipulation and formatting
- **class-variance-authority**: Component variant management
- **nanoid**: Unique ID generation for client-side operations