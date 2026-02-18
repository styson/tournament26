import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useAuth } from '@/config/auth';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tournament26</h1>
          <p className="text-gray-600">Sign in to manage your tournaments</p>
        </div>

        <div className="card">
          <Authenticator
            socialProviders={['google']}
            hideSignUp={false}
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Sign in with your Google account to get started
        </p>
      </div>
    </div>
  );
}
