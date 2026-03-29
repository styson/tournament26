import { useState } from 'react';

export default function Standings() {
  const [standings] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Field Report</div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Standings
          </h1>
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedTournament}
            onChange={(e) => setSelectedTournament(e.target.value)}
            style={{
              background: 'var(--c-bg)',
              color: selectedTournament ? 'var(--c-text)' : 'var(--c-muted)',
              border: '1px solid var(--c-border)',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: '0.7rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0.4rem 2rem 0.4rem 0.75rem',
              outline: 'none',
              appearance: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select Tournament</option>
          </select>
          <span style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)', fontSize: '0.6rem', pointerEvents: 'none' }}>▼</span>
        </div>
      </div>

      <div className="card anim-1" style={{ padding: 0, overflow: 'hidden' }}>
        {standings.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '4rem', color: 'var(--c-raised)', letterSpacing: '0.05em' }}>ST-00</div>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', letterSpacing: '0.06em', color: 'var(--c-muted)', margin: 0 }}>
              {selectedTournament ? 'No Data Available' : 'Select a Tournament'}
            </h3>
            <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: 'var(--c-muted-dim)', margin: 0, textAlign: 'center' }}>
              {selectedTournament
                ? 'No games have been logged for this tournament'
                : 'Choose a tournament above to view its standings'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th style={{ textAlign: 'center' }}>W</th>
                  <th style={{ textAlign: 'center' }}>L</th>
                  <th style={{ textAlign: 'center' }}>Games</th>
                  <th style={{ textAlign: 'center' }}>Win %</th>
                  <th style={{ textAlign: 'center' }}>OWR</th>
                </tr>
              </thead>
              <tbody>
                {/* Standing rows */}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
