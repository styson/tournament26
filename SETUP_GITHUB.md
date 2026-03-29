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
gh repo create tournament26 --public --source=. --description "WW2 Board Game Tournament Tracker" --remote=origin --push
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

## Local Development

To run the app locally:

```bash
npm run dev
```

The app will be available at http://localhost:5173
