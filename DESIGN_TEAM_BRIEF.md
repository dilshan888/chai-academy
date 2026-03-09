# Design Team Brief: ChAI Academy (Phases 5 & 6)

## 1. Project Overview
**ChAI Academy** is a gamified EU AI Act compliance training platform for university staff. We have already successfully built out the core learning platform, the gamification engine (XP, streaks, levels, leaderboards, achievements), and the interactive scenario features.

## 2. Objectives & Goals
*What are we trying to achieve with this design?*
- Transition the learning interface from a flat "lesson list" to a structured Course > Module > Lesson hierarchy.
- Introduce visual designs for end-of-course Certificates that learners can view, print, and showcase.
- Enhance the Admin Dashboard with data visualizations (department charts) and certificate tracking.

## 3. Target Audience
- **Primary Users (Learners):** University administrative staff. They need an intuitive, motivating, and clear interface that guides them through compliance requirements without feeling overwhelming.
- **Secondary Users (Admins):** University Compliance Administrators. They need data-rich, easily scannable dashboard views to monitor staff progress, department compliance rates, and issued certificates.

## 4. Scope of Work / Deliverables
- [ ] High-fidelity mockups for the **Course Directory / My Courses** page
- [ ] High-fidelity mockups for the **Course Detail View** (with Module Accordions)
- [ ] High-fidelity mockups for the **Certificate Gallery**
- [ ] Visual design/layout for a **Printable Certificate**
- [ ] High-fidelity mockups for **Admin Dashboard Enhancements** (Charts and Analytics)

## 5. Key Features & User Flows
1. **My Courses / Course Directory:** A card grid showing available courses. Each course card needs an accent gradient header, a progress bar, course duration, and the total XP reward.
2. **Course Detail View (Module Accordion):** When a user clicks a course, they should see its modules. Modules should be expandable (accordion style) to reveal the individual lessons within them.
3. **Certificates View:** A gallery showing miniature versions of all certificates a user has earned.
4. **Printable Certificate:** A formal, beautifully designed certificate document displaying the user's name, the course title, date of issue, and a unique certificate number.
5. **Research Hub:** A simple, scannable layout for curated EU AI Act resources and documentation.
6. **Admin Data Visualizations:** Add department-based progress charts to the existing Admin Panel.

## 6. Brand Guidelines & Aesthetics
- **Primary Colors:** Accent color is `--accent: 343 63% 38%` (Hex: `#9d2447`).
- **Typography:** Clean, readable sans-serif (current standard system font or Next.js Inter).
- **Style/Vibe:** Modern, clean, professional but engaging. We are using a minimalist UI enhanced with gamification elements.
- **Icons:** We are currently using `lucide-react` icons.

## 7. Technical Constraints
- The project is built with Next.js and Vanilla CSS + CSS Modules. **We are NOT using Tailwind CSS**.
- Mocks should be easy to implement with standard CSS grid/flexbox.
- The UI must be fully responsive (Mobile-first).

## 8. Competitors & Inspiration
- **Duolingo:** For gamification progress mechanics and engaging UI.
- **Coursera / Udemy:** For course structure and module accordions.

## 9. Timeline & Milestones
*(To be agreed upon with the design team)*
- **[Date]:** Initial Concepts / Wireframes
- **[Date]:** Review Session
- **[Date]:** Final Handoff

## 10. Questions for the Design Team
- How can we make the Course Cards stand out while keeping them consistent with our existing Achievements and Leaderboard UI?
- What chart library or visual style do you recommend for the Admin Dashboard visualizations?
