# Contributing to ChAI Academy

Thank you for your interest in contributing to ChAI Academy! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Format](#commit-message-format)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)
- [Code Style](#code-style)

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chai-academy.git
   cd chai-academy
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```
5. **Set up the database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```
6. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch from `main` for your feature or bugfix
2. Make your changes
3. Test your changes locally
4. Commit your changes following our commit message format
5. Push to your fork
6. Create a Pull Request

## Branch Naming Conventions

Use the following prefixes for branch names:

- `feature/` - New features
  - Example: `feature/user-authentication`
- `fix/` - Bug fixes
  - Example: `fix/login-validation`
- `docs/` - Documentation updates
  - Example: `docs/api-endpoints`
- `refactor/` - Code refactoring
  - Example: `refactor/prisma-queries`
- `test/` - Adding or updating tests
  - Example: `test/course-api`
- `chore/` - Maintenance tasks
  - Example: `chore/update-dependencies`

### Branch Naming Format

```
<type>/<short-description>
```

**Examples:**
- `feature/course-enrollment`
- `fix/lesson-progress-tracking`
- `docs/setup-instructions`

## Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Scope (Optional)

The scope should be the name of the affected module:
- `auth`
- `courses`
- `lessons`
- `users`
- `api`
- `db`
- `ui`

### Examples

```
feat(courses): add course enrollment functionality

Implement the ability for users to enroll in courses.
- Add enrollment API endpoint
- Update course model with enrollment count
- Add enrollment UI component

Closes #123
```

```
fix(lessons): resolve progress tracking bug

Fixed an issue where lesson progress was not being saved correctly
when users completed lessons.

Fixes #456
```

```
docs(readme): update setup instructions

Added more detailed database setup instructions and troubleshooting section.
```

## Pull Request Process

1. **Update your branch** with the latest changes from `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Ensure all tests pass**:
   ```bash
   npm run lint
   npm run build
   ```

3. **Create a Pull Request** with:
   - Clear title following commit message format
   - Detailed description of changes
   - Screenshots/videos for UI changes
   - Link to related issues

4. **PR Title Format**:
   ```
   <type>(<scope>): <description>
   ```
   Example: `feat(courses): add course enrollment`

5. **PR Description Template**:
   ```markdown
   ## Description
   Brief description of what this PR does.

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Changes Made
   - Change 1
   - Change 2
   - Change 3

   ## Screenshots (if applicable)
   [Add screenshots here]

   ## Testing
   - [ ] Tested locally
   - [ ] All tests pass
   - [ ] No console errors

   ## Related Issues
   Closes #issue_number
   ```

6. **Wait for review** - At least one approval is required before merging

## Code Review Guidelines

### For Reviewers

- **Be respectful and constructive** in your feedback
- **Review within 24-48 hours** when possible
- **Check for**:
  - Code quality and readability
  - Adherence to project conventions
  - Potential bugs or edge cases
  - Performance implications
  - Security concerns
  - Test coverage

- **Use GitHub's review features**:
  - Comment on specific lines
  - Request changes if needed
  - Approve when satisfied

### For Authors

- **Respond to feedback** promptly and professionally
- **Make requested changes** or discuss alternatives
- **Keep PRs focused** - one feature/fix per PR
- **Keep PRs small** - easier to review (<400 lines preferred)
- **Update your PR** based on feedback

## Code Style

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** rules (run `npm run lint`)
- Use **meaningful variable names**
- Add **comments** for complex logic
- Use **async/await** over promises

### React Components

- Use **functional components** with hooks
- Keep components **small and focused**
- Use **TypeScript interfaces** for props
- Follow **naming conventions**:
  - Components: PascalCase (`UserProfile.tsx`)
  - Utilities: camelCase (`formatDate.ts`)
  - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Prisma

- Use **descriptive model names** (PascalCase)
- Add **comments** to complex relations
- Use **enums** for fixed sets of values
- Follow **naming conventions** in schema

### CSS/Tailwind

- Use **Tailwind CSS** utility classes
- Keep custom CSS minimal
- Use **consistent spacing** (4, 8, 16, 24, 32, etc.)
- Follow **mobile-first** approach

## Questions?

If you have questions about contributing, please:
- Check existing issues and discussions
- Open a new discussion on GitHub
- Reach out to maintainers

Thank you for contributing to ChAI Academy! 🎓
