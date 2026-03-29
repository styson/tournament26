import { useState } from 'react';
import { Link } from '@tanstack/react-router';

export default function Games() {
  const [games] = useState([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div className="anim-0" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div className="section-label" style={{ marginBottom: '0.3rem' }}>Game Log</div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.4rem', letterSpacing: '0.06em', margin: 0 }}>
            Games
          </h1>
        </div>
        <Link to="/games/new" className="btn-primary">▶ Record Game</Link>
      </div>

      <div className="card anim-1" style={{ padding: 0, overflow: 'hidden' }}>
        {games.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '4rem', color: 'var(--c-raised)', letterSpacing: '0.05em' }}>GM-00</div>
            <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.4rem', letterSpacing: '0.06em', color: 'var(--c-muted)', margin: 0 }}>
              No Games Recorded
            </h3>
            <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.95rem', color: 'var(--c-muted-dim)', margin: 0, textAlign: 'center' }}>
              Begin logging game results to track tournament progress
            </p>
            <Link to="/games/new" className="btn-primary" style={{ marginTop: '0.5rem' }}>▶ Record First Game</Link>
          </div>
        ) : (
          <div style={{ padding: '1rem' }} />
        )}
      </div>
    </div>
  );
}
