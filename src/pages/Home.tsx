import { Link } from 'react-router-dom';
import { useAuth } from '@/config/auth';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center px-2 sm:px-4">
      <div className="max-w-4xl mx-auto text-center w-full">
        {/* Hero Section */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
            Hello World!
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-600">
            Tournament26
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Track players, games, and standings for your WW2 board game tournaments with ease.
            Built for Tournament Directors.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mt-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary px-6 py-2">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="btn-primary px-6 py-2">
                Sign In with Google
              </Link>
            )}
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-8">
            <div className="card">
              <div className="text-primary-600 text-2xl sm:text-3xl mb-2">👥</div>
              <h3 className="text-sm sm:text-base font-semibold mb-1">Player Management</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Track player profiles and historical performance
              </p>
            </div>
            <div className="card">
              <div className="text-primary-600 text-2xl sm:text-3xl mb-2">🎯</div>
              <h3 className="text-sm sm:text-base font-semibold mb-1">Tournament Control</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Manage tournaments, rounds, and game pairings
              </p>
            </div>
            <div className="card sm:col-span-2 md:col-span-1">
              <div className="text-primary-600 text-2xl sm:text-3xl mb-2">📊</div>
              <h3 className="text-sm sm:text-base font-semibold mb-1">Live Standings</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Real-time standings with opponent strength tracking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
