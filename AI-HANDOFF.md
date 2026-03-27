# ChAI Academy - AI Assistant Handoff Document

## Project Overview

**ChAI Academy** is a gamified EU AI Act compliance training platform for university staff, built with Next.js 16 (App Router), PostgreSQL (Neon), Prisma ORM, NextAuth v4, and vanilla CSS with CSS Modules (NO Tailwind).

**Repo**: https://github.com/dilshan888/chai-academy
**Current Branch**: `copilot/finalize-codebase-folder`
**Main Branch**: `main`

---

## What Has Been Built (Phases 1-4 COMPLETE)

### Phase 1: Foundation (DONE)
- Extended Prisma schema with gamification models: `UserGamification`, `XPTransaction`, `StreakRecord`, `Achievement`, `UserAchievement`
- Added user fields: `department`, `jobTitle`, `avatarUrl`, `weeklyEmailSummary`, `learningPace`, `onboardingComplete`
- Built sidebar navigation (`src/components/layout/Sidebar.tsx`) with role-based links (admin vs learner)
- Created placeholder pages for `/achievements`, `/certificates`, `/courses`

### Phase 2: Gamification Engine (DONE)
- Gamification service at `src/lib/gamification.ts` with functions: `awardXP()`, `updateStreak()`, `checkAndAwardBadges()`, `calculateLevel()`, `getLevelTitle()`, `getUserStats()`
- 7 level tiers: Novice (0), Apprentice (100), Practitioner (300), Specialist (600), Expert (1000), Master (1500), Champion (2500)
- API endpoints: `/api/gamification/stats`, `/api/gamification/leaderboard`, `/api/gamification/achievements`
- Redesigned learner dashboard (`src/components/features/DashboardView.tsx`) with stat cards, learning progress, achievements panel
- XP notification toast (`src/components/ui/XPNotification.tsx`)
- XP integrated into lesson completion flow via `/api/progress`
- ProgressContext (`src/lib/ProgressContext.tsx`) extended with gamification state

### Phase 3: Achievements, Leaderboards, Profile (DONE)
- Achievements page (`src/components/features/achievements/AchievementsView.tsx`) with two tabs: Leaderboards and My Showcase
- Leaderboard with department filter, global rank/percentile calculation
- Profile page (`src/components/features/profile/ProfileView.tsx`) with editable info, learning path timeline, stats
- Avatar component (`src/components/ui/Avatar.tsx`) - initial-based with deterministic colors
- Settings page now redirects to `/profile`
- Sidebar updated: "Settings" -> "Profile" for staff users

### Phase 4: Interactive Scenarios (DONE)
- Prisma models: `Scenario` and `ScenarioResponse` (see `prisma/schema.prisma`)
- 6 scenarios seeded via `/api/seed` route (one per lesson), covering EU AI Act topics
- API endpoints: `GET /api/scenarios`, `GET /api/scenarios/[id]`, `POST /api/scenarios/[id]/respond`
- Scenario page at `/scenario/[id]` with `ScenarioView` component
- Two-column layout: main (situation, choices, feedback) + sidebar (impact meters, pro tip)
- Risk level badges color-coded (HIGH=amber, LIMITED=yellow, MINIMAL=green, UNACCEPTABLE=red)
- XP awards: 30 base + 20 bonus for optimal choice
- Lesson completion screen shows "Try the Interactive Scenario" CTA

---

## What Needs to Be Built Next

### Phase 5: Course Structure & My Courses Page (NEXT)

**Goal**: Evolve from flat lesson list to Course > Module > Lesson hierarchy.

**Database changes** (`prisma/schema.prisma`):
- New model: `Course` - `title`, `slug` (unique), `description`, `imageUrl`, `duration`, `xpReward` (default 500), `sortOrder`, `published` (Boolean)
- New model: `Module` - `courseId` (FK), `title`, `slug`, `description`, `sortOrder`. Unique on [courseId, slug]
- New model: `ModuleLesson` (junction) - `moduleId`, `lessonId`, `sortOrder`. Unique on [moduleId, lessonId]

**Seed data**: Organize existing 6 lessons into one course:
- Course: "AI Basics & EU AI Act for Administrative Staff"
  - Module 1 "Understanding AI": Lessons 1-2
  - Module 2 "Data Protection & Regulation": Lessons 3-4
  - Module 3 "Risk & Responsibility": Lessons 5-6

**New API endpoints**:
- `src/app/api/courses/route.ts` - GET: list courses with module count + user progress
- `src/app/api/courses/[slug]/route.ts` - GET: full course with modules, lessons, user progress

**New components**:
- `src/components/features/courses/CoursesView.tsx` - Course card grid
- `src/components/features/courses/CourseCard.tsx` - Accent gradient header, progress bar, duration, XP
- `src/components/features/courses/CourseDetailView.tsx` - Expanded view with module accordion
- `src/components/features/courses/ModuleAccordion.tsx` - Expandable module with lesson list
- `src/components/features/courses/courses.module.css`

**Modifications**:
- Update `src/components/features/dashboard/LearningProgressCard.tsx` to pull from course data
- Update `src/lib/ProgressContext.tsx` to calculate progress from course total (not hardcoded /6)
- Replace placeholder at `src/app/(dashboard)/courses/page.tsx`

### Phase 6: Certificates & Admin Enhancements

**Database**: New model `Certificate` - `userId`, `courseId`, `title`, `issuedAt`, `certificateNumber` (unique cuid)

**New files**:
- `src/lib/certificates.ts` - `issueCertificate()` function
- `src/app/api/certificates/route.ts` - GET: list user's certificates
- `src/app/api/certificates/[id]/route.ts` - GET: certificate detail
- `src/components/features/certificates/CertificatesView.tsx` - Gallery
- `src/components/features/certificates/CertificatePreview.tsx` - Printable certificate

**Modifications**:
- `src/app/api/progress/route.ts` - Auto-issue certificate when all course lessons complete
- `src/components/features/AdminDashboardView.tsx` - Already rewritten with stat cards + user table, but needs department charts and certificate tracking added

### Phase 7: Research Hub, Notifications, Polish

- Research Hub page at `/research` with curated EU AI Act resources
- Notification bell in header (badge earned, streak milestone, certificate issued)
- Loading skeletons (`loading.tsx`) and error boundaries (`error.tsx`) for key routes
- Database indexes for performance
- CSS polish pass, dark mode verification

---

## Key Technical Details

### Tech Stack
- **Framework**: Next.js 16 (App Router) with `"use client"` components
- **Database**: PostgreSQL on Neon, managed via Prisma ORM
- **Auth**: NextAuth v4, Credentials Provider, JWT sessions, Role enum (LEARNER/ADMIN)
- **Styling**: Vanilla CSS + CSS Modules (NO Tailwind) - brand color `--accent: 343 63% 38%` (#9d2447)
- **Icons**: lucide-react
- **DB push**: Use `npx prisma db push` (not `migrate dev` - it fails in non-interactive environments)

### Authentication
- Two roles: `ADMIN` and `LEARNER`
- Anyone can register as LEARNER at `/register`
- Admin created via seed (`admin@uni.edu` / `chai-academy`) or manual DB change
- Seeded learner: `staff@uni.edu` / `chai-academy`
- Session includes: `id`, `name`, `email`, `role`

### Important Patterns
- Next.js 16 params are Promises: `{ params }: { params: Promise<{ id: string }> }` then `const { id } = await params`
- Client components using params: `import { use } from 'react'` then `const { id } = use(params)`
- Prisma Json fields require double cast: `scenario.options as unknown as ScenarioOption[]`
- Lessons are static data in `src/data/lessons.ts` (keys "1" through "6")
- Seed route at `/api/seed` populates: users, achievements, gamification records, scenarios

### Project Structure
```
src/
  app/
    (auth)/login, register
    (dashboard)/dashboard, lesson/[id], scenario/[id], achievements, certificates, courses, profile, admin
    api/
      auth/[...nextauth]
      register
      user
      progress
      seed
      admin/users
      gamification/stats, leaderboard, achievements
      scenarios, scenarios/[id], scenarios/[id]/respond
  components/
    layout/DashboardLayout, Sidebar, Header
    features/DashboardView, AdminDashboardView, LoginForm, OnboardingForm
    features/lesson/LessonView
    features/scenario/ScenarioView + scenario.module.css
    features/achievements/AchievementsView + achievements.module.css
    features/profile/ProfileView + profile.module.css
    features/admin/admin-dashboard.module.css
    ui/button, card, progress-bar, Avatar, XPNotification
  lib/auth, prisma, gamification, ProgressContext
  data/lessons.ts
prisma/schema.prisma
```

### Git Workflow
- Separate feature branch per phase
- Merge to `main` between phases
- Branch naming: `feature/phase-N-description`
- Current state: Phases 1-3 merged to `main`, Phase 4 on `feature/phase-4-interactive-scenarios` (pushed, not yet merged to main)

---

## How to Continue

1. **Create next feature branch**: `git checkout -b feature/phase-5-course-structure`
2. **Start Phase 5** following the plan above
3. **Run dev server**: `npm run dev` (make sure disk space is available)
4. **Seed database**: Visit `http://localhost:3000/api/seed` after starting
5. **Push schema changes**: `npx prisma db push`
6. **Build check**: `npm run build` to verify no TypeScript errors

---

## Full Plan Document

The complete 7-phase plan is at: `.claude/plans/idempotent-snuggling-puddle.md`
This file contains detailed specifications for every phase including verification criteria.
