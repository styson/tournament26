import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/config/auth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Players', href: '/players' },
    { name: 'Tournaments', href: '/tournaments' },
    { name: 'Games', href: '/games' },
    { name: 'Scenarios', href: '/scenarios' },
    { name: 'Standings', href: '/standings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between items-center h-12 sm:h-14">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-1.5">
                <div className="w-7 h-7 bg-primary-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-900 hidden xs:inline">Tournament26</span>
              </Link>
            </div>

            {/* Navigation */}
            {user && (
              <nav className="hidden md:flex gap-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            )}

            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 hidden sm:inline truncate max-w-32">
                  {user.name || user.email}
                </span>
                <button
                  onClick={signOut}
                  className="btn-secondary"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
          <p className="text-center text-xs text-gray-500">
            © 2026 Tournament26
          </p>
        </div>
      </footer>
    </div>
  );
}
