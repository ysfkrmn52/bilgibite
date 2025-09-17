# Overview

BilgiBite is a modern Turkish quiz application designed to provide an engaging and personalized learning experience across various exam categories. It features a full-stack architecture with a React frontend, Express.js backend, and PostgreSQL database, offering timed quizzes, performance tracking, achievements, and gamification. The platform aims to integrate advanced AI features for personalized learning paths, adaptive difficulty, and an interactive AI tutoring chatbot, alongside comprehensive social learning functionalities and specific support for Turkish national exams. Its vision is to be a leading educational tool in Turkey, leveraging technology to enhance learning outcomes and user engagement.

# User Preferences

Preferred communication style: Simple, everyday language in Turkish.
Language: Turkish (user requested Turkish responses)

# System Architecture

## Frontend Architecture

The client-side is a React with TypeScript SPA, using Tailwind CSS and shadcn/ui for a responsive design system with light theme only. Wouter handles routing, while TanStack React Query manages server state. Framer Motion provides smooth animations, and Vite is used for build processes. Key features include PWA support, Turkish i18n, and a Duolingo-style onboarding flow with an interactive mascot.

## Backend Architecture

The server is a RESTful API built with Express.js and TypeScript. It features a structured API, custom logging, and centralized error handling. Authentication is handled via Firebase Authentication, supporting email/password, Google, and Facebook social logins.

## Database Layer

PostgreSQL is used with Drizzle ORM for type-safe operations. The schema includes tables for users, exam categories, questions, user progress, quiz sessions, achievements, and comprehensive gamification data (XP, achievements, daily challenges, store, leaderboard). Neon Database provides serverless hosting.

## System Design Choices

- **AI-Powered Learning**: Integration with Claude AI for personalized study plans, smart question generation based on user weaknesses, adaptive difficulty, and an AI tutoring chatbot. AI-generated content persists and automatically queues questions for database integration.
- **Gamification**: Extensive Duolingo-style gamification with XP, lives, streaks, achievements, daily challenges, and a leaderboard.
- **Social Learning**: Features include a friend system, challenge system (head-to-head quizzes), weekly leagues, study groups, and a social activity feed.
- **Analytics Dashboard**: Comprehensive personal learning dashboard with interactive charts (Recharts) for performance analysis, study pattern insights, and goal tracking.
- **Turkish Exam Specifics**: Dedicated features for Turkish national exams (YKS, KPSS, Ehliyet, SRC) including authentic mock exam interfaces, specific scoring systems, and question banks from official sources.
- **Admin Panel**: Advanced admin panel with multi-admin support, role-based access control, CRUD operations for content and users, bulk operations (e.g., PDF import for questions), and detailed statistics.
- **Security & Production Readiness**: Implemented Firebase Admin SDK for server-side auth, robust security middleware, error reporting, health checks, and SEO optimization.

# Environment Variables for Production

## CORS Configuration
- **FRONTEND_URL**: The main frontend URL for production (e.g., 'https://your-domain.com')
- **ALLOWED_ORIGINS**: Comma-separated list of additional allowed origins (e.g., 'https://app.example.com,https://cdn.example.com')
- **REPL_SLUG**: Automatically set by Replit for hosted apps
- **REPL_OWNER**: Automatically set by Replit for hosted apps

## Usage in Production
```bash
# Example environment variables for production deployment
FRONTEND_URL=https://bilgibite.com
ALLOWED_ORIGINS=https://app.bilgibite.com,https://admin.bilgibite.com
NODE_ENV=production
```

The CORS configuration automatically:
- Uses localhost URLs in development
- Supports Replit.app domains when deployed on Replit
- Uses environment variables for production domains
- Provides secure headers and methods for all environments

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting.
- **Drizzle ORM**: Type-safe database client.

## Authentication
- **Firebase Authentication**: User authentication (email/password, Google, Facebook).
- **Firebase Admin SDK**: Server-side authentication and user management.

## UI and Design
- **Tailwind CSS**: Utility-first CSS framework.
- **shadcn/ui**: Pre-built component library based on Radix UI.
- **Radix UI**: Accessible component primitives.
- **Framer Motion**: Animation library.
- **Lucide React**: Icon library.
- **Recharts**: Charting library for data visualizations.

## Development Tools
- **Vite**: Build tool and development server.
- **TypeScript**: Static typing for development.
- **TanStack React Query**: Server state management.
- **React Hook Form**: Form validation.
- **Zod**: Schema validation.
- **Multer**: File upload handling (for bulk question import).

## Modern Web Features
- **PWA Support**: Service worker and web app manifest.
- **react-i18next**: Internationalization (Turkish/English).

## AI Integration
- **Claude AI**: For intelligent learning features (tutoring, question generation, adaptive difficulty).

## Utilities and Helpers
- **clsx**: Conditional CSS class composition.
- **date-fns**: Date manipulation.
- **nanoid**: Unique ID generation.