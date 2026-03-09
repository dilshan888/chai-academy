# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**ChAI Academy** — a gamified EU AI Act compliance training platform for university staff.

## Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # TypeScript + Next.js production build
npm run lint       # ESLint
npx prisma db push # Push schema changes to DB (use this, NOT migrate dev)
npx prisma studio  # Browse database in browser UI
```

**After pulling schema changes:** `npx prisma generate` (also runs automatically via `postinstall`).

**Initial database setup:**
1. Create `.env` with `DATABASE_URL="postgresql://..."` and `NEXTAUTH_SECRET="..."` and `NEXTAUTH_URL="http://localhost:3000"`
2. `npx prisma db push`
3. Visit `http://localhost:3000/api/seed` once to populate users, achievements, scenarios

**Seed credentials:**
- Learner: `learner@chai.edu` / `learner123`
- Admin: `admin@chai.edu` / `admin123`

## Architecture

### Tech Stack
- **Next.js 16** (App Router) with `"use client"` for interactive components
- **PostgreSQL** (Neon) via **Prisma ORM** — singleton client at `src/lib/prisma.ts`
- **NextAuth v4** — Credentials provider, JWT sessions; config at `src/lib/auth.ts`
- **CSS Modules** with vanilla CSS — NO Tailwind. Brand color: `--accent: 343 63% 38%` (#9d2447)
- **lucide-react** for icons, **recharts** for charts

### Route Groups
- `(auth)` — `/login`, `/register` — public, no layout
- `(dashboard)` — all authenticated pages, wrapped in `DashboardLayout` (Sidebar + Header)
- `api/` — REST API routes, mostly protected via `getServerSession(authOptions)`

### Key Patterns

**Next.js 16 async params** — params are Promises:
```ts
// Server components
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
// Client components
import { use } from 'react'
const { id } = use(params)
```

**Role-based access** — check in API routes:
```ts
const session = await getServerSession(authOptions)
if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

**Prisma JSON fields** require double cast:
```ts
scenario.options as unknown as ScenarioOption[]
```

### Data Model Overview

The curriculum follows a `Phase → Module → Lesson → LessonContent` hierarchy:
- `LessonContent.steps` is a JSON field containing the lesson block array
- `Scenario` is 1:1 with `Lesson` (each lesson has one optional scenario)
- `Progress` is 1:1 per (user, lesson) — tracks completion and quiz score

**Gamification models:** `UserGamification` (XP/level/streak), `XPTransaction` (audit log), `StreakRecord` (daily), `Achievement`, `UserAchievement`

**Level tiers** (defined in `src/lib/gamification.ts`): Novice → Apprentice → Practitioner → Specialist → Expert → Master → Champion (at 2500 XP)

### State Management

`ProgressContext` (`src/lib/ProgressContext.tsx`) is the primary client-side state:
- Loaded by `DashboardLayout` wrapping all dashboard pages
- Tracks `completedLessons[]`, gamification `stats`, and XP toast `xpNotifications`
- `markLessonComplete(id, score?)` calls `POST /api/progress`, updates stats, triggers XP toasts
- `overallProgress` is calculated dynamically from `completedLessons.length / totalLessons`

### Admin Routes
Admin panel lives under `(dashboard)/admin/`:
- `/admin` — dashboard overview (`AdminDashboardView`)
- `/admin/lessons` — lesson/content management (`ContentManager`)
- `/admin/phases`, `/admin/modules`, `/admin/scenarios`, `/admin/analytics`, `/admin/settings`

### Styling Conventions
- Each major view has a co-located `.module.css` file
- CSS variables from `globals.css` use HSL format: `hsl(var(--accent))`
- Dark mode uses `.dark` class on `<body>`

## Development Notes

- The `AI-HANDOFF.md` file contains the full 7-phase roadmap with detailed specs for planned features (Phases 5–7: Course structure, Certificates, Research Hub, Notifications)
- The complete plan is also at `.claude/plans/idempotent-snuggling-puddle.md`
- Run `npm run build` before considering any feature complete — TypeScript errors will fail CI
