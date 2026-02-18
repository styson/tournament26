import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Tournaments() {
  const [tournaments] = useState([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
          <p className="text-gray-600 mt-1">Manage and track your tournaments</p>
        </div>
        <Link to="/tournaments/new" className="btn-primary">
          Create Tournament
        </Link>
      </div>

      {/* Tournaments List */}
      <div className="grid gap-6">
        {tournaments.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tournaments yet</h3>
            <p className="text-gray-600 mb-6">Create your first tournament to get started</p>
            <Link to="/tournaments/new" className="btn-primary">
              Create Your First Tournament
            </Link>
          </div>
        ) : (
          tournaments.map((tournament: any) => (
            <div key={tournament.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{tournament.name}</h3>
                  <p className="text-gray-600 mt-1">{tournament.description}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>👥 {tournament.participants?.length || 0} players</span>
                    <span>🎮 {tournament.games || 0} games</span>
                    <span>📅 {tournament.startDate}</span>
                  </div>
                </div>
                <Link
                  to={`/tournaments/${tournament.id}`}
                  className="btn-secondary"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
