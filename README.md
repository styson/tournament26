# Tournament26

A modern, sleek web application for tracking players, games, and standings of board game tournaments. Built for Tournament Directors.

## Features

- **Player Management**: Track player profiles, contact information, and historical tournament data
- **Tournament Control**: Manage multiple tournaments with rounds and game pairings
- **Game Tracking**: Record game results with attacker/defender roles and scenario tracking
- **Scenario Library**: Browse and select from predefined scenarios with nationality assignments
- **Live Standings**: Real-time tournament standings with opponent strength tracking

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS
- **State Management**: React Query + Zustand
- **Backend**: AWS Amplify (Auth, API, Database)
- **Authentication**: Google OAuth via AWS Amplify Auth
- **Deployment**: AWS Amplify Hosting
- **CI/CD**: GitHub Actions

## Project Structure

```
tournament26/
├── src/
│   ├── components/
│   │   ├── common/          # Shared components (Layout, ProtectedRoute)
│   │   ├── players/         # Player-specific components
│   │   ├── tournaments/     # Tournament-specific components
│   │   ├── rounds/          # Round-specific components
│   │   ├── games/           # Game-specific components
│   │   ├── scenarios/       # Scenario-specific components
│   │   └── standings/       # Standings-specific components
│   ├── pages/               # Page components
│   ├── services/            # API service layer
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state stores
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── config/              # Configuration files (AWS Amplify, Auth)
├── .github/workflows/       # GitHub Actions workflows
└── public/                  # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- AWS Account
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tournament26.git
cd tournament26
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your AWS Amplify configuration:
- `VITE_AWS_REGION`
- `VITE_AWS_USER_POOL_ID`
- `VITE_AWS_USER_POOL_CLIENT_ID`
- `VITE_AWS_OAUTH_DOMAIN`
- `VITE_AWS_API_ENDPOINT`
- `VITE_APP_URL`

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## AWS Amplify Setup

### 1. Create Cognito User Pool

1. Go to AWS Cognito Console
2. Create a new User Pool
3. Configure Google as a social identity provider:
   - Go to Google Cloud Console
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs from Cognito
   - Copy Client ID and Secret to Cognito

### 2. Set Up API Gateway

1. Create a REST API in API Gateway
2. Create resources for:
   - `/players`
   - `/tournaments`
   - `/games`
   - `/scenarios`
   - `/rounds`
   - `/standings`
3. Enable CORS
4. Deploy the API

### 3. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `VITE_AWS_REGION`
- `VITE_AWS_USER_POOL_ID`
- `VITE_AWS_USER_POOL_CLIENT_ID`
- `VITE_AWS_OAUTH_DOMAIN`
- `VITE_AWS_API_ENDPOINT`
- `VITE_APP_URL`

### 4. Deploy to AWS Amplify

Option 1: Connect GitHub repository to AWS Amplify Console
Option 2: Use GitHub Actions workflow (included)

## Domain Models

### Player
- ID, name, email, phone, location
- Historical tournament data

### Tournament
- Multiple players
- Consists of rounds
- Tracks status (draft, active, completed)

### Round
- Part of a tournament
- Has 1-5 available scenarios
- Contains games

### Game
- Two players (defender/attacker)
- One scenario
- Tracks results and opponent records

### Scenario
- Predefined scenario listing
- Defender and attacker nationalities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Contact

For questions or support, please open an issue on GitHub.
