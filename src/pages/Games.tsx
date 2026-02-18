import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Games() {
  const [games] = useState([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Games</h1>
          <p className="text-gray-600 mt-1">Track and record game results</p>
        </div>
        <Link to="/games/new" className="btn-primary">
          Record Game
        </Link>
      </div>

      {/* Games List */}
      <div className="card">
        {games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No games recorded</h3>
            <p className="text-gray-600 mb-6">Start recording game results to track tournament progress</p>
            <Link to="/games/new" className="btn-primary">
              Record Your First Game
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Game cards will be rendered here */}
          </div>
        )}
      </div>
    </div>
  );
}
