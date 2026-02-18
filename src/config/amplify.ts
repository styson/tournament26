import { ResourcesConfig } from 'aws-amplify';

/**
 * AWS Amplify Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Create an AWS Amplify app in the AWS Console
 * 2. Set up Google OAuth:
 *    - Go to Google Cloud Console > APIs & Services > Credentials
 *    - Create OAuth 2.0 Client ID
 *    - Add authorized redirect URIs (Amplify will provide these)
 * 3. In AWS Amplify Console:
 *    - Go to Authentication > Add social provider > Google
 *    - Enter your Google Client ID and Client Secret
 * 4. Replace the placeholder values below with your actual AWS resources
 *
 * For local development, create a .env file with:
 * VITE_AWS_REGION=your-region
 * VITE_AWS_USER_POOL_ID=your-user-pool-id
 * VITE_AWS_USER_POOL_CLIENT_ID=your-client-id
 * VITE_AWS_API_ENDPOINT=your-api-endpoint
 */

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_AWS_USER_POOL_ID || 'us-east-1_XXXXXXXXX',
      userPoolClientId: import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID || 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_AWS_OAUTH_DOMAIN || 'your-app-domain.auth.us-east-1.amazoncognito.com',
          scopes: ['email', 'profile', 'openid'],
          redirectSignIn: [import.meta.env.VITE_APP_URL || 'http://localhost:5173/'],
          redirectSignOut: [import.meta.env.VITE_APP_URL || 'http://localhost:5173/'],
          responseType: 'code',
          providers: ['Google'],
        },
      },
    },
  },
  API: {
    REST: {
      TournamentAPI: {
        endpoint: import.meta.env.VITE_AWS_API_ENDPOINT || 'https://api.example.com',
        region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      },
    },
  },
};

export default amplifyConfig;
