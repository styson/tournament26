# GitHub Repository Setup Instructions

The local Git repository has been initialized and your initial commit has been created.

## Option 1: Using GitHub CLI (Recommended)

If you haven't authenticated GitHub CLI yet, run:

```bash
cd tournament26
gh auth login
```

Then create and push the repository:

```bash
gh repo create tournament26 --public --source=. --description "Tournament Tracker" --remote=origin --push
```

## Option 2: Manual Setup via GitHub Website

1. Go to https://github.com/new
2. Create a new repository named `tournament26`
3. Make it **public**
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

Then run these commands:

```bash
cd tournament26
git remote add origin https://github.com/styson/tournament26.git
git branch -M main
git push -u origin main
```

## Verify the Push

After pushing, verify your repository at:
```
https://github.com/styson/tournament26
```

## Next Steps

1. Set up AWS Amplify (see README.md for instructions)
2. Configure GitHub Secrets for CI/CD:
   - Go to Settings > Secrets and variables > Actions
   - Add the secrets listed in README.md
3. Deploy to AWS Amplify Hosting

## Supabase Keep-Alive

`.github/workflows/supabase-keepalive.yml` signs in and queries Supabase daily so the free-tier project isn't paused for inactivity.

1. In the Supabase dashboard, create a dedicated user (e.g. `keepalive@yourdomain`) with a strong password
2. Add these repo secrets (Settings > Secrets and variables > Actions):
   - `SUPABASE_URL` — same as `VITE_SUPABASE_URL`
   - `SUPABASE_ANON_KEY` — same as `VITE_SUPABASE_ANON_KEY`
   - `KEEPALIVE_EMAIL`, `KEEPALIVE_PASSWORD` — the dedicated user's credentials
3. Test with `gh workflow run supabase-keepalive.yml` (or Actions tab > Run workflow)

## Local Development

To run the app locally:

```bash
npm run dev
```

The app will be available at http://localhost:5173
