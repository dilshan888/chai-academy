# ChAI Academy 🤖🎓

**AI Literacy & EU AI Act Training for University Administrative Staff**

ChAI Academy is a lightweight, calm, and privacy-focused learning platform designed to help university staff understand the basics of Artificial Intelligence and the new EU AI Act regulations.

## 🚀 Features

*   **Interactive Lessons**: Short, digestible modules on AI basics, Privacy, and High-Risk classifications.
*   **Scenario-Based Learning**: Real-world university admin scenarios (e.g., "The CV Sorter", "The Grade Dispute").
*   **Progress Tracking**: Lesson and assessment progress tracking backed by PostgreSQL.
*   **Interactive Quizzes**: Immediate feedback on understanding.
*   **Admin Dashboard**: Overview of learner progress with exportable reports.
*   **Certified & Accessible**: High-contrast, calm design system for adult learners.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 16 (App Router)
*   **Backend**: Next.js API routes + NextAuth v4
*   **Database**: PostgreSQL + Prisma ORM
*   **Styling**: Vanilla CSS (CSS Modules) with a custom Design System variables.
*   **State Management**: React Context + API-backed persistence.
*   **Deployment**: Vercel (Edge Network).

## 🏃‍♂️ Getting Started

### Prerequisites
*   Node.js 18+ installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/dilshan888/chai-academy.git
    cd chai-academy
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Create a `.env` file:
    ```bash
    DATABASE_URL="postgresql://..."
    NEXTAUTH_SECRET="..."
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Database Setup (Important)**:
    *   Create a Postgres database (e.g., Neon.tech).
    *   Run `npx prisma db push` to create tables.
    *   Run `npm run dev`.
    *   Visit `http://localhost:3000/api/seed` **ONCE** to create the initial users.

5.  Open [http://localhost:3000](http://localhost:3000) for the app.

## 🔑 Credentials (Real Database)

After seeding (`/api/seed`), use these logins:

*   **Learner**: `staff@uni.edu` / `chai-academy`
*   **Admin**: `admin@uni.edu` / `chai-academy`

## 🎮 How to Demo

1.  **Login** as `staff@uni.edu`.
2.  **Start a Lesson** (e.g., Lesson 2).
3.  Complete the quiz to see the **Progress Bar** update.
4.  Go back to the Dashboard to see the "Done" status.
5.  **Reset Progress**: Scroll to the bottom of the Dashboard and click "Reset My Progress" to clear your data for the next demo.
6.  **Logout** and login as Admin to see the reporting view.

## 📚 Additional Documentation

* `AI-HANDOFF.md` — project status, completed phases, and next-phase backlog.
* `CLAUDE.md` — architecture notes, coding patterns, and command quick-reference.
* `DEPLOY.md` / `DEPLOY_GITLAB.md` — deployment guides.

## 📄 License
University Project - Digital Media / Sem 3
