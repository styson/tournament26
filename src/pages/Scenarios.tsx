import { useState } from 'react';

export default function Scenarios() {
  const [scenarios] = useState([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scenarios</h1>
          <p className="text-gray-600 mt-1">Browse available WW2 scenarios</p>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <div className="text-6xl mb-4">⚔️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scenarios available</h3>
            <p className="text-gray-600">Scenarios will be loaded from the database</p>
          </div>
        ) : (
          scenarios.map((scenario: any) => (
            <div key={scenario.id} className="card hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {scenario.title}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Defender:</span>
                  <span className="font-medium">{scenario.defenderNationality}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attacker:</span>
                  <span className="font-medium">{scenario.attackerNationality}</span>
                </div>
              </div>
              {scenario.description && (
                <p className="text-gray-600 text-sm mt-3">{scenario.description}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
