# Deploying ChAI Academy to Vercel

The easiest way to deploy is using Vercel (the creators of Next.js).

## 1. Prepare GitHub Repository
1. Go to [GitHub.com](https://github.com/new) and create a **new empty repository**.
   - Name it `chai-academy`.
   - **Do not** check "Add README" or ".gitignore".
2. Copy the repository URL (e.g., `https://github.com/YOUR_USERNAME/chai-academy.git`).

## 2. Push Your Code
Run the following commands in your terminal:

```bash
# Initialize a fresh repository for this project
git init

# Add all files
git add .

# Commit
git commit -m "Initial MVP Build"

# Link to GitHub (Replace URL with your actual one)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chai-academy.git
git push -u origin main
```

## 3. Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Import the `chai-academy` repository.
4. Click **Deploy**.
5. Wait ~1 minute, and your site is live!
