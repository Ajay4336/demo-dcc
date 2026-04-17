# Delivery Command Center (DCC)

A **Next.js** web application that demonstrates a **delivery intelligence** workspace: portfolio and project views, **deterministic risk scoring** from Jira- and GitHub-shaped signals (mock data), **Ask the Delivery Brain** Q&A, **executive summaries**, an **agent marketplace** with a lightweight **governance** layer (audit, approvals, kill switch), and **session-based auth** with workspace and roles.

This repository is an **MVP / demo**: integrations are **simulated**, and agent installs / runs / audit entries persist in the **browser** (`localStorage`) unless you extend the app to use Supabase tables.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Authentication & roles](#authentication--roles)
- [Risk engine](#risk-engine)
- [Sprint comparison](#sprint-comparison)
- [Agents & governance](#agents--governance)
- [Supabase (optional)](#supabase-optional)
- [Project structure](#project-structure)
- [Scripts](#scripts)
- [Security notes](#security-notes)
- [License](#license)

---

## Features

| Area | Description |
|------|-------------|
| **Dashboard** | Portfolio snapshot, value proposition (metrics, data inputs, client/business benefits), seeded project stats. |
| **Projects** | List and **project detail**: health overview, risk & confidence, **8-component risk breakdown**, factor cards, mock Jira/GitHub cards, sprint status. |
| **Sprint comparison** | Current sprint vs **manually tagged “on-track”** closed sprints (mock history + baseline averages). |
| **Delivery Brain** | Grounded Q&A with citations from project signals; optional LLM polish banner via env. |
| **Executive summary** | Internal vs client-ready text, copy, **version history** (local). *Note:* This panel is **computed on the page** from project data; it is not the same artifact as the Executive Summary **agent run** line in history. |
| **Marketplace** | Install/remove agents; agent detail page; policy labels. |
| **Agents** | Run installed agents with optional project target; **run history** table. |
| **Governance** | Audit log, pending **approvals** (executive-class agents), **kill switch** (admin). |
| **Auth** | Cookie session (`dcc-session`), login/signup (demo), workspace switcher. |

---

## Tech stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router), **React 19**
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (`@import "tailwindcss"` in `globals.css`)
- **Auth session:** HTTP-only cookie + base64 JSON payload (demo; replace with production identity)
- **Database (optional):** [Supabase](https://supabase.com/) client via `@supabase/ssr` — middleware refreshes session when env is set
- **Demo persistence:** `localStorage` keys under `dcc/v1/*` in `src/lib/demo-store.ts`

---

## Prerequisites

- **Node.js** 20+ (recommended; matches typical Next 15 setups)
- **npm** (or use `pnpm` / `yarn` with equivalent commands)

---

## Getting started

```bash
git clone https://github.com/Ajay4336/demo-dcc.git
cd demo-dcc
npm install
```

Create a local env file from the example (Supabase is optional for local UI):

```bash
copy .env.example .env.local   # Windows
# cp .env.example .env.local     # macOS / Linux
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to **`/login`**.

**Demo login:** use any email/password the UI accepts (see login page); you can choose **Admin / Editor / Viewer** to test permissions.

Production build:

```bash
npm run build
npm start
```

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | No* | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No* | Supabase anon key |
| `NEXT_PUBLIC_DELIVERY_BRAIN_POLISH` | No | Set to `1` to show an “LLM polish” banner on Delivery Brain (wire your model separately) |

\*If both are omitted, the app still runs; Supabase auth refresh in middleware is skipped. Use `src/lib/supabase/client.ts` helpers when you add real data layers.

See `.env.example` for a template. **Never commit real secrets**; keep them in `.env.local` (gitignored).

---

## Authentication & roles

- **Session cookie:** `dcc-session` (HTTP-only), set by `/api/auth/login` and `/api/auth/signup`.
- **Workspace:** `src/data/workspaces.ts` — switch via `/api/auth/workspace` and the sidebar control.
- **Roles:**
  - **Admin** — full access, including governance kill switch.
  - **Editor** — can install/run agents (subject to kill switch).
  - **Viewer** — read-only; cannot install or run agents.

Protected routes are enforced in `src/middleware.ts` (plus optional Supabase user refresh when configured).

---

## Risk engine

Delivery risk is a **weighted sum** of eight **0–100** sub-scores (see `src/lib/delivery/scoreProject.ts`):

| Component | Weight |
|-----------|--------|
| Backlog aging | 0.15 |
| Blocker | 0.20 |
| Reopen | 0.15 |
| Overdue | 0.10 |
| PR review delay (merge time proxy) | 0.10 |
| Stale PR | 0.10 |
| Workload imbalance (proxy) | 0.10 |
| Scope churn | 0.10 |

**Confidence** is derived from the composite risk score with a small stability bonus when blockers are low.

Mock projects live in `src/data/scenarios.ts` (`PROJECT_SCENARIOS`). Each scenario includes **Jira** and **GitHub** numeric fields used by the engine.

---

## Sprint comparison

`historicSprints` on each project (same file) holds **closed** sprints with a boolean **`taggedOnTrack`** (manual baseline). The UI compares **current** `jira` metrics to the **average** of tagged sprints (`src/lib/sprint/baseline.ts`, `src/components/projects/sprint-comparison-panel.tsx`).

---

## Agents & governance

- **Catalog:** `src/data/agent-catalog.ts` — Delivery Risk, Executive Summary (requires approval to **run** in the demo flow), Helpdesk.
- **Installs / runs / approvals / summaries / kill switch:** `src/lib/demo-store.ts` (browser storage).
- **Executive Summary agent:** may create a **queued** run pending approval (`Governance` → Approvals).
- **Project panel** exposes quick-run buttons for **Delivery Risk** and **Executive Summary** only; **Helpdesk** appears on the **Agents** page when installed.

---

## Supabase (optional)

- **Browser client:** `src/lib/supabase/client.ts` — `getBrowserSupabase()` returns `null` if env is missing.
- **Server client:** `src/lib/supabase/server.ts` — for Server Components / Route Handlers when wired.
- **SQL sketch:** `supabase/migrations/001_mvp_core.sql` — starter tables for projects, agents, audit, etc. Adjust RLS for your org.

A larger schema experiment also exists under `techwave-command-center/db/migrations/` in this repo (partial duplicate layout); the **primary app** you run is under **`src/`** at the repository root.

---

## Project structure (main app)

```text
src/
  app/
    (app)/           # Authenticated shell: dashboard, projects, marketplace, agents, governance
    (auth)/          # login, signup
    api/auth/        # login, logout, signup, workspace
    layout.tsx       # Root layout
    globals.css
  components/        # UI: layout shell, dashboard, projects, governance, etc.
  content/           # Static positioning copy (dcc-positioning.ts)
  data/              # Mock scenarios, workspaces, agent catalog
  domain/            # Shared TypeScript types
  lib/
    auth/            # Session, permissions
    delivery/        # Risk scoring, Delivery Brain
    demo-store.ts    # localStorage governance + agent state
    risk-engine/     # Re-exports scoring API
    sprint/          # Sprint baseline math
    supabase/
  middleware.ts      # Auth gate + optional Supabase cookie refresh
supabase/migrations/ # Optional DB migration SQL
```

Path alias: `@/*` → `src/*` (see `tsconfig.json`).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |

---

## Security notes

- Treat **demo auth** as **non-production**; replace with your IdP or Supabase Auth patterns.
- **Rotate keys** if they were ever committed; use `.env.local` for secrets.
- Enable **RLS** and policies on Supabase tables before exposing anon keys to clients.

---

## License

Private / unlicensed unless you add a `LICENSE` file. Confirm with your organization before open-sourcing.

---

## Remote repository

Upstream example: [github.com/Ajay4336/demo-dcc](https://github.com/Ajay4336/demo-dcc)

```bash
git remote add origin https://github.com/Ajay4336/demo-dcc.git
git push -u origin main
```

(Adjust remote if you use SSH or a fork.)
