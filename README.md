# Team Task Dashboard

## Project Overview
This is a Team Task Dashboard built with Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, Zustand, and Vitest. The project focuses on a responsive task-tracking workflow for assignees, priorities, due dates, filters, and task lifecycle actions.

The current implementation is a frontend-only mock dashboard. It uses a browser-local mock API with deterministic seed data and controlled failure simulation for development and tests. It does not persist to a real database or remote backend.

## Features
- Responsive dashboard shell with sidebar, summary cards, and task list
- Search by title or description
- Status, assignee, and priority filtering
- Sorting by due date, title, or priority
- Pagination for large task sets
- Create, edit, and delete task flows
- Inline assignment and status controls on each task card
- Loading, empty, and retry states
- Validation for required task form fields
- Theme switching with persisted preference state
- React Query caching with optimistic updates and rollback on failure

## Technology Stack
- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- TanStack Query 5
- Zustand 5
- Vitest + Testing Library

## Setup Instructions
```bash
npm install
```

## Development Command
```bash
npm run dev
```
Open http://localhost:3000.

## Test Command
```bash
npm test
```

## Build Command
```bash
npm run build
```

## Architecture Overview
- `src/app` contains the Next.js App Router shell and route entrypoint.
- `src/components/dashboard` contains the dashboard and modal form UI.
- `src/lib` provides mock API behavior, validation logic, and task utilities.
- `src/store/use-preferences.ts` stores persistent UI settings with Zustand.
- `src/providers/query-provider.tsx` configures the React Query client.
- `src/types/task.ts` defines the task domain model.

## React Query Data Flow
The dashboard reads task data through `useQuery` from the mock API layer. The query key is `['tasks']` and all mutations invalidate or refetch that specific query when needed.

Mutations use the standard TanStack Query pattern:
1. Cancel in-flight queries.
2. Capture the previous cache state.
3. Apply an optimistic change to the cached task array.
4. Execute the mock API call.
5. Reconcile on success.
6. Restore the previous cache data on failure.

## Zustand Responsibilities
The Zustand store is responsible for UI state that should persist between sessions in the browser, including:
- `search`
- `statusFilter`
- `priorityFilter`
- `assigneeFilter`
- `sortMode`
- `sortDirection`
- `theme`

Persistence is handled with Zustand `persist`, and hydration is gated with `hasHydrated` to avoid server/client mismatch issues.

## CRUD Implementation
Create, read, update, and delete flows are implemented through the mock API in `src/lib/mock-api.ts`.

- Create: adds a new task to the task array and updates local storage
- Read: fetches the current collection from local storage
- Update: patches an existing task and writes the updated list back
- Delete: filters out the target task and restores the list state on failure

The dashboard uses `useMutation` for create/update/delete/status/assignee actions and updates the UI immediately through React Query cache writes.

## Optimistic Update Implementation
Optimistic updates are applied in the dashboard mutation handlers. For example, when a status or assignee changes, the existing cache is edited before the API request resolves. This makes the UI feel immediate without waiting for the mock request to finish.

The optimistic update logic is paired with failure handling to guarantee rollback behavior.

## Rollback Behavior on API Failure
The mock API includes a deterministic failure mode for development and tests. This is disabled by default and protected from production usage. When enabled for a specific operation, the request throws an error and the previous query cache is restored before the UI is updated.

This means the user sees the optimistic update immediately and then the final state snaps back if the mock request rejects.

## Testing Strategy
Automated tests cover:
- filtering by title, description, status, priority, assignee, and combined filters
- sorting and pagination behavior
- empty-result handling
- mock API failure injection
- optimistic cache transitions and rollback restoration

## Feature Status
| Feature | Status | Evidence |
|---------|--------|----------|
| Dashboard UI | Verified | UI renders and production build succeeds |
| Search and filters | Verified | Utility tests cover filtering and filter controls are implemented |
| CRUD | Verified | Mock API and mutation flows are in place and tested |
| Optimistic updates | Verified | Query cache tests validate optimistic state transitions |
| Rollback | Verified | Failure-mode tests restore prior query cache data |
| Zustand persistence | Partial | Store code persists preferences; browser hydration was not manually exercised in this environment |
| Responsive layout | Partial | Layout styles are implemented, but no browser automation screenshot was captured here |

## Actual Verification Results
The following commands were run in the project directory and executed successfully:

- `npm test` → passed
- `npx tsc --noEmit` → passed
- `npm run build` → passed

## Known Limitations
- The dashboard is frontend-only and stores task state in browser local storage instead of a database.
- Refreshing the page can restore the stored mock state in the same browser, but not across devices or shared servers.
- The mock API failure mode is intentionally disabled outside development/test environments.
- Live deployment status was not changed as part of this validation pass.

## Mock API Limitations
The mock API is designed for UI demonstration and automated verification. It simulates latency and controlled failure paths, but it does not provide production-grade persistence, concurrency control, or backend validation.

## Demo Instructions
Run the app locally:
```bash
npm run dev
```
Then open the app at http://localhost:3000 and verify:
1. Dashboard loads with seeded tasks.
2. Search and filters narrow the list correctly.
3. Create a new task and validate required fields.
4. Edit a task title or assignee and confirm the change appears immediately.
5. Change status using the inline selector.
6. Delete a task and confirm the item disappears.
7. Trigger the mock failure mode in development to confirm rollback behavior.

## AI Assistance Disclosure
This project was implemented and reviewed in a local coding environment using AI-assisted development workflows. The final verification was performed against the actual project files and terminal output in this environment.

## Demo Script (2-3 minutes)
1. Open the dashboard landing page to show the seeded task list and KPI cards.
2. Use the search and filter controls to narrow the tasks by assignee or status.
3. Click “Create task” and add a task with valid fields; confirm the item appears in the list.
4. Edit the task, change its assignee, and update the status from the inline controls.
5. Delete a task and confirm the task is removed.
6. Trigger the mock failure mode in a test or dev session to show the optimistic update rollback and error handling.
7. Highlight the passing test command output and production build as proof of working state.

Expected reviewer observations:
- The task list updates immediately.
- Loading and error states are visible when appropriate.
- Failed mock requests restore the previous UI state.
- The build and test commands complete without errors.
