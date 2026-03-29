# Project: WW2 Tournament Tracker

## Overview
A modern, sleek web app for a tournament director (TD) to track players, games, and standings for a WW2 board game tournament.

## Tech Stack
- **Frontend:** React + Vite + TypeScript
- **Backend:** AWS (Amplify, Cognito, AppSync or API Gateway, DynamoDB)
- **Auth:** Google OAuth via AWS Amplify Authentication
- **CI/CD:** GitHub Actions → AWS Amplify Hosting
- **Repo:** `tournament26` on GitHub

## Domain Model

### Player
Fields: name, phone, email, location
- Full CRUD via a Players page
- Activity history: past tournaments, W/L records, opponents

### Tournament
- Multiple tournaments tracked independently
- Players are enrolled per tournament
- Contains one or more rounds

### Round
- Belongs to a tournament
- Has 1–5 scenarios selected as available for that round
- TD controls player pairings

### Scenario (predefined)
Fields: id, title, attacker nationality, defender nationality (e.g., American, German)

### Game
- Belongs to a round
- Two players: one attacker, one defender
- One scenario selected
- Records outcome (win/loss per player)

### Standings (per tournament)
Each player tracks: wins, losses, opponents faced, opponent W/L record at time of match

## Key Pages / Modules
- **Players** — CRUD for player roster
- **Tournaments** — create/manage tournaments, enroll players
- **Rounds** — manage rounds, select available scenarios, set pairings
- **Games** — record game results (scenario, roles, outcome)
- **Standings** — live standings table with opponent records
- **Auth** — Google sign-in via AWS Amplify

## Development Guidelines
- Use TypeScript strictly throughout
- Component-first architecture; colocate styles and tests
- AWS Amplify CLI for backend provisioning
- GitHub Actions workflow triggers on push to `main` for Amplify deploy
