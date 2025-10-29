TALENT-FLOW

Overview
- Talent-Flow is a React + Vite + TypeScript application for managing jobs, candidates, and job assessments.
- It includes HR tools to create and manage assessments and a candidate flow to attempt and submit assessments.

Tech Stack
- React 18, TypeScript, Vite 5
- React Router v6
- Dexie (IndexedDB) for local persistence
- shadcn/ui (Radix UI) + Tailwind CSS
- React Query (TanStack Query) for client-side data fetching/cache (light usage)

Getting Started
Prerequisites
- Node.js >= 18
- npm (or pnpm/yarn)

Install
```bash
npm install
# or
pnpm install
```

Run the app (development)
```bash
npm run dev
```
This starts Vite and shows a local URL (typically http://localhost:5173). Open it in your browser.

Build for production
```bash
npm run build
npm run preview  # serve the production build locally
```

Available Scripts
- npm run dev: Start the Vite dev server
- npm run build: Build production assets
- npm run build:dev: Development-mode build
- npm run preview: Preview the build locally
- npm run lint: Run ESLint

Project Structure (key paths)
- src/
  - main.tsx: Vite React entry
  - App.tsx: App routes and protected routing
  - contexts/AuthContext.tsx: Simple auth with roles (‘hr’ or ‘candidate’)
  - lib/db.ts: Dexie database and types (jobs, assessments, responses, etc.)
  - components/ui/*: UI primitives
  - components/AssessmentPreview.tsx: Live preview of assessment questions
  - pages/
    - Index.tsx: Landing/login
    - Jobs.tsx, JobDetails.tsx: Job listings and details
    - Assessments.tsx: List jobs + assessment actions
    - CreateAssignment.tsx: HR-create workflow for assessments
    - AssessmentBuilder.tsx: HR edit workflow per job
    - AttemptAssessment.tsx: Candidate assessment attempt page

Authentication & Roles
- The app uses a lightweight, in-browser auth context.
- Login at the landing page and choose a role:
  - hr: Can create and edit assessments.
  - candidate: Can view available assessments and attempt them.

Routing (high level)
- /: Index (login/select role)
- /assessments: List of jobs with assessment status
- /assessments/create: HR – create a new assignment
- /assessments/:jobId/builder: HR – edit assessment for a specific job
- /assessments/:jobId/attempt: Candidate – attempt assessment for a specific job

Assessments: How it works
Data Model (simplified) – see src/lib/db.ts
- Assessment: { id, jobId, sections: Section[], createdAt }
- Section: { id, title, questions: Question[] }
- Question: { id, type, text, required?, options?, minValue?, maxValue?, maxLength?, conditionalOn? }
- AssessmentResponse: { id, assessmentId, candidateId, answers, submittedAt }

HR Flow
1) Navigate to Assessments → Create New Assignment (/assessments/create)
2) Select a Job. The form generates job-related starter questions (you can edit/add/remove).
3) Save the assessment. This persists to IndexedDB via Dexie.
4) Optionally refine using the Builder (/assessments/:jobId/builder).

Candidate Flow
1) Navigate to Assessments as a candidate.
2) Click “Attempt Assessment” on a job that has an assessment.
3) You will be redirected to /assessments/:jobId/attempt where all sections/questions are rendered.
4) Validation enforces required fields, numeric ranges, and max lengths.
5) Conditional questions appear based on previous answers when configured.
6) Submit to save an AssessmentResponse in IndexedDB and return to the Assessments page.

Question Types
- short-text: Single-line input; supports optional maxLength.
- long-text: Multi-line textarea; supports optional maxLength.
- single-choice: Radio buttons from options.
- multi-choice: Checkbox list from options.
- numeric: Number input with optional minValue/maxValue.
- file-upload: UI stub included; no actual file persistence implemented.

Persistence
- All data is stored in the browser using IndexedDB via Dexie (see src/lib/db.ts).
- This is suitable for demos and local development. For production use, replace with a real backend/API and server-side storage.

Styling & UI
- Tailwind CSS is configured in tailwind.config.ts, with utility classes used throughout.
- Components under src/components/ui are shadcn/ui-based primitives.

Extending or Integrating a Backend
- Replace Dexie calls in pages and lib/db.ts with API calls.
- Keep the data shapes consistent with the current types or update types and usage accordingly.

Troubleshooting
- Blank Page or Module Errors:
  - Ensure Node >= 18 and that dependencies installed successfully (npm install).
  - Delete node_modules and lockfile (package-lock.json or pnpm-lock.yaml) and reinstall.
  - Clear browser cache and IndexedDB for the site if data/state seems stuck.
- Port Already in Use:
  - Vite will prompt for a new port or run: npm run dev -- --port=5174
- Type Errors in Editor:
  - Ensure TypeScript and @types packages are installed (they are included in devDependencies).

Notes
- This project uses only client-side data storage (IndexedDB). Submissions are not sent to a server.
- The file upload question type is a non-functional placeholder by default.

License
- For internal/demo use. Add your preferred license if distributing.


