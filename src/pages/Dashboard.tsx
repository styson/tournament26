import { useAuth } from '@/config/auth';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { name: 'Active Tournaments', value: '0', link: '/tournaments' },
    { name: 'Total Players', value: '0', link: '/players' },
    { name: 'Games Played', value: '0', link: '/games' },
    { name: 'Scenarios Available', value: '0', link: '/scenarios' },
  ];

  const quickActions = [
    { name: 'Add Player', link: '/players/new', icon: '➕' },
    { name: 'Create Tournament', link: '/tournaments/new', icon: '🏆' },
    { name: 'Record Game', link: '/games/new', icon: '🎮' },
    { name: 'View Standings', link: '/standings', icon: '📊' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Welcome Header */}
      <div className="card">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome, {user?.name || 'Director'}!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Tournament activity overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.link}>
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <p className="text-xs text-gray-600 mb-0.5">{stat.name}</p>
              <p className="text-2xl font-bold text-primary-600">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-base sm:text-lg font-semibold mb-2">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.link}
              className="flex flex-col items-center justify-center p-2 sm:p-3 border-2 border-gray-200 rounded hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <span className="text-xl sm:text-2xl mb-1">{action.icon}</span>
              <span className="text-xs font-medium text-gray-700 text-center">{action.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-base sm:text-lg font-semibold mb-2">Recent Activity</h2>
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No recent activity</p>
          <p className="text-xs mt-1">Activity will appear once you start managing tournaments</p>
        </div>
      </div>
    </div>
  );
}
