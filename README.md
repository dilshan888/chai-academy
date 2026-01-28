# ChAI Academy 🎓

A modern learning platform designed for university admin staff to develop AI competency skills. Built with Next.js 14, Prisma, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- 🎯 **Course Management** - Create and manage AI competency courses
- 📚 **Lesson System** - Structured lessons with markdown content
- 👥 **User Roles** - Admin, Instructor, and Staff roles
- 📊 **Progress Tracking** - Track lesson completion and course progress
- 🎓 **Enrollment System** - Enroll in courses and track learning journey
- 🔐 **Secure Authentication** - Ready for NextAuth.js or Supabase Auth integration
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- 🚀 **Modern Stack** - Built with Next.js 14 App Router and TypeScript

## 🛠 Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React](https://react.dev/)** - UI library

### Backend
- **[Prisma ORM](https://www.prisma.io/)** - Type-safe database ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[Supabase](https://supabase.com/)** - Database hosting and backend services

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting (recommended)
- **[TypeScript](https://www.typescriptlang.org/)** - Static type checking

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** or **yarn**
- **PostgreSQL database** (Supabase recommended)
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/chai-academy.git
   cd chai-academy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your database credentials:

   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data (optional)
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
chai-academy/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seeding script
│   └── migrations/            # Database migrations (git-ignored)
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── health/        # Health check endpoint
│   │   │   └── db-test/       # Database test endpoint
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   └── lib/                   # Utility functions
│       └── prisma.ts          # Prisma client singleton
├── public/                    # Static assets
├── .env                       # Environment variables (git-ignored)
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── CONTRIBUTING.md            # Contributing guidelines
├── README.md                  # This file
├── next.config.mjs            # Next.js configuration
├── package.json               # Dependencies and scripts
├── prisma.config.ts           # Prisma configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:migrate:deploy` | Deploy migrations (production) |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:seed` | Seed database with sample data |

## 🗄 Database Schema

### Models

#### User
- Stores user information and authentication data
- Roles: `ADMIN`, `INSTRUCTOR`, `STAFF`
- Fields: email, name, role, department, avatarUrl

#### Course
- Educational courses with categories
- Categories: `AI_FUNDAMENTALS`, `PROMPT_ENGINEERING`, `AI_TOOLS`, `AI_ETHICS`, `DATA_LITERACY`, `ADVANCED_AI`
- Fields: title, description, category, estimatedTime, thumbnailUrl, isPublished

#### Lesson
- Individual learning units within courses
- Fields: title, content (markdown), order, duration
- Ordered within each course

#### Enrollment
- Many-to-many relationship between Users and Courses
- Tracks when users enroll in courses

#### Progress
- Tracks lesson completion for each user
- Fields: isCompleted, completedAt
- Unique constraint on (userId, lessonId)

### Relationships

```
User ─┬─< Enrollment >─┬─ Course
      └─< Progress >────┴─ Lesson >─ Course
```

## 🔌 API Endpoints

### Health Check
```
GET /api/health
```
Returns API health status.

### Database Test
```
GET /api/db-test
```
Tests database connection and returns record counts.

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."          # Pooled connection (port 6543)
DIRECT_URL="postgresql://..."            # Direct connection (port 5432)

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication (add your auth provider)
# NEXTAUTH_SECRET=""
# NEXTAUTH_URL=""
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Set these in your deployment platform:
- `DATABASE_URL` - Pooled connection string
- `DIRECT_URL` - Direct connection string
- `NEXT_PUBLIC_APP_URL` - Your production URL

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Development workflow
- Branch naming conventions
- Commit message format
- Pull request process
- Code review guidelines

## 📄 License

This project is private and proprietary. All rights reserved.

## 👥 Team

- **Project Lead**: [Your Name]
- **Contributors**: See [Contributors](https://github.com/YOUR_USERNAME/chai-academy/graphs/contributors)

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact the development team
- Check the [documentation](docs/)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- ORM by [Prisma](https://www.prisma.io/)

---

Made with ❤️ for university admin staff learning AI
