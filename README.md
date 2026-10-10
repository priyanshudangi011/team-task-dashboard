# Team Task Management Dashboard

## Overview
This project is a production-style team task management dashboard built with Next.js, TypeScript, Tailwind CSS, TanStack Query, Zustand, and Vitest. It is designed for team planning, status tracking, assignment workflows, and responsive management across desktop and mobile devices.

## Features
- Responsive dashboard layout with sidebar navigation
- KPI cards for total, completed, in-progress, and overdue tasks
- Search, filters, sorting, and pagination
- Create, edit, delete, assign, and status update workflows
- Light and dark theme support
- Mock API with deterministic task data and simulated latency
- Strict TypeScript and reusable business logic utilities
- Automated tests for filtering, sorting, pagination, and form validation

## Tech Stack
- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Vitest + Testing Library

## Screenshots
Placeholder for real screenshots after UI is reviewed and captured.

## Prerequisites
- Node.js 18+ recommended
- npm 9+

## Installation
```bash
npm install
```

## Local Development
```bash
npm run dev
```
Then open http://localhost:3000.

## Testing
```bash
npm run test
```

## Production Build
```bash
npm run build
```

## Architecture
This app separates concerns into clearly defined layers:
- `src/types` for shared domain types
- `src/lib` for mock API, validation, and pure business utilities
- `src/store` for persisted UI preference state
- `src/providers` for TanStack Query configuration
- `src/app` for the Next.js App Router shell and page layout

## Mock API Limitations
The mock data layer is for UI development and testing. It simulates network delay and returns typed responses, but it does not provide a real persistence layer across browser refreshes or server restarts unless a backend or stable storage layer is implemented.

## Known Limitations
- LocalStorage is used only for client-side mock persistence.
- Data is not shared across devices or browser profiles.
- This is a frontend-only dashboard demo with simulated business logic.

## Deployment
Use a hosting platform such as Vercel. Connect the repository and deploy with the default Next.js settings. If environment variables are added later, configure them in the hosting dashboard before deployment.

## AI Assistance Disclosure
This project was created with AI-assisted development support in a local coding environment. The implementation is intended to be reviewed and validated before production use.

## Suggested Three-Developer Work Division
### Developer 1
- Layout
- Responsive dashboard UI
- Reusable components
- Accessibility

### Developer 2
- Mock API
- CRUD workflows
- TanStack Query integration
- Optimistic updates and rollback

### Developer 3
- Zustand preferences
- Search/filter/sort/pagination
- Test coverage
- README and quality checks

## Code Review Checklist
- TypeScript strictness preserved
- No unused imports
- Query keys consistent
- Optimistic rollover handled correctly
- Validation rules clear and accessible
- Empty and error states covered
- Theme/perference persistence works without hydration issues

## Completed vs Pending
### Completed
- Project structure and scaffold
- Shared type definitions
- Mock API and deterministic seed data
- Validation logic
- Filtering, sorting, and pagination utilities
- Basic test coverage for utility logic

### Pending
- Full dashboard UI
- Task forms and modal flows
- Query mutations and optimistic updates
- Error handling and snackbar/alert states
- Final end-to-end quality pass
