# TalentFlow

TalentFlow is a modern, feature-rich hiring management platform designed to streamline the recruitment process for HR teams and offer a seamless application experience to candidates. Built with **React**, **Vite**, **Dexie (IndexedDB for local storage)**, and a modern component/UI toolkit powered by **Tailwind CSS** & **Radix UI**.

---

## Features

- **Role-Based Access:** Dedicated HR and Candidate portals, each with relevant dashboards and capabilities.
- **Job Management:** Create, edit, archive, and reorder job listings.
- **Candidate Tracking:**
  - List, search, and filter candidates by stage and job.
  - Kanban pipeline board — drag-and-drop candidates between stages (Applied, Screening, Tech, Offer, Hired, Rejected).
  - Candidate profiles with contact info, timeline history, and notes.
- **Assessment Management:** Build, assign, and edit job assessments (multi-section, multiple question types).
- **Application Flow:** Candidates can apply to jobs and attempt dedicated assessments.
- **Mock API & Local Persistence:** Uses **msw** and **Dexie** for instant, persistent local operation — _no backend server needed_.
- **Beautiful Responsive UI:** Built with custom UI primitives, dark mode support, and consistent styling.

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, or bun

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
📂 public/
  ├─ mockServiceWorker.js    # MSW for intercepting API requests
  ├─ robots.txt              # SEO config

📂 src/
  ├─ assets/                 # Static assets (e.g., hero images)
  ├─ components/             # UI components and domain logic
  │    ├─ ui/                # Design system (button, card, form, sidebar, etc.)
  ├─ contexts/               # React Contexts (auth, etc.)
  ├─ hooks/                  # Reusable React hooks
  ├─ lib/
  │    ├─ db.js              # Dexie database schema
  │    ├─ mock-api.js        # Mock backend API logic (msw handlers)
  │    ├─ seed-data.js       # DB seeder (random jobs/candidates/assessments)
  │    └─ utils.js           # Utility functions (className merging, etc.)
  ├─ pages/                  # Route-level components (Jobs, Candidates, Assessments, etc.)
  ├─ App.jsx                 # App endpoints & route structure
  ├─ main.jsx                # App entry, worker/bootstrap logic
  ├─ index.css, App.css      # Main styles

Project config:
  ├─ package.json, vite.config.js     # Tooling/bundler config
  ├─ tailwind.config.js, postcss.config.js # Tailwind setup
  ├─ tsconfig*.json                   # TypeScript config files
```

---

## Usage & Roles

- **HR Users:** Can manage jobs/candidates, create & modify assessments, track applicant progress, and move candidates through the pipeline.
- **Candidates:** Can browse/apply to jobs, attempt assigned assessments, and review their progress.
- **Login:** Simple in-browser (no backend auth). Select HR or Candidate on the home page.

---

## Key Functionality Overview

- **Jobs (`/jobs`):** All job opportunities. HR can add, update, archive, and reorder jobs. Candidates can browse and show interest.
- **Candidates (`/candidates`):** Pipeline of applicants. Filter/search, view detailed profiles, view application timelines, and manage notes.
- **Kanban Board (`/candidates/kanban`):** Visual pipeline for moving candidates between recruiting stages.
- **Assessments (`/assessments`):** HR can create and assign assessments per job, customize sections/questions. Candidates can access and attempt assessments.
- **Persistence:** All changes are stored in your browser (IndexedDB); the "mock API" makes the app feel like a real backend exists.

---

## Customization & Extensibility

- **UI Components:** Check `src/components/ui/` for all generic reusable UI.
- **Auth & Routing:** See `src/contexts/AuthContext.jsx` and `src/App.jsx` for user flows and role protection.
- **Data/Backend Simulation:** All requests are mocked via `msw` (handled in-browser, see `src/lib/mock-api.js`).

---

## Credits

- Built with **React**, **Vite**, **Dexie**, **Radix UI**, **Tailwind CSS**, and **msw**.


---

## License

MIT (feel free to adapt)
