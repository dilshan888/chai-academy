# Deploying ChAI Academy to Vercel (using GitLab)

Since you have GitLab, here is how to connect it.

## 1. Create a GitLab Project
1. Go to [GitLab.com/projects/new](https://gitlab.com/projects/new).
2. Select **"Create blank project"**.
3. Name it: `chai-academy`.
4. Visibility Level: **Public** or **Private** (Private is fine).
5. **Uncheck** "Initialize repository with a README".
6. Click **Create project**.

## 2. Push Your Code to GitLab
Copy the "Clone with HTTPS" URL from your new project (e.g., `https://gitlab.com/YOUR_USERNAME/chai-academy.git`).

Run these commands in your VS Code terminal:

```bash
# Rename branch to main (standard)
git branch -M main

# Add your GitLab remote (REPLACE WITH YOUR ACTUAL URL)
git remote add origin https://gitlab.com/YOUR_USERNAME/chai-academy.git

# Push the code
git push -u origin main
```
*Note: You may be asked for your GitLab username/password or a Personal Access Token.*

## 3. Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com) and log in.
2. Click **"Add New..."** -> **"Project"**.
3. Instead of GitHub, look for the **"Import Third-Party Git Repository"** link (or "Add GitLab Account" if visible).
   - Alternatively, just paste your GitLab HTTPS URL into the search bar if Vercel asks for a URL.
4. Vercel will ask to connect to your GitLab account. Authorize it.
5. Select the `chai-academy` project.
6. Click **Deploy**.
