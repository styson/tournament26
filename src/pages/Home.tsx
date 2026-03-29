import { Link } from '@tanstack/react-router';
import { useAuth } from '@/config/auth';

const features = [
  {
    code: '01',
    title: 'Player Roster',
    desc: 'Maintain complete dossiers — history, W/L records, opponent strength.',
  },
  {
    code: '02',
    title: 'Tournaments',
    desc: 'Run multiple tournaments simultaneously with independent round control.',
  },
  {
    code: '03',
    title: 'Live Intel',
    desc: 'Real-time standings with Buchholz-style opponent strength metrics.',
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--c-bg)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Dot grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, var(--c-raised) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        pointerEvents: 'none',
      }} />

      {/* Radial vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, transparent 30%, var(--c-bg) 80%)',
        pointerEvents: 'none',
      }} />

      {/* Diagonal accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: '15%',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, var(--c-border) 30%, var(--c-border) 70%, transparent 100%)',
        transform: 'skewX(-8deg)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

        {/* Top coordinate label */}
        <div className="anim-0" style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--c-muted)', textTransform: 'uppercase' }}>
            // Tournament Director Platform
          </span>
        </div>

        {/* Hero heading */}
        <h1 className="anim-1" style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 'clamp(4rem, 12vw, 9rem)',
          letterSpacing: '0.06em',
          lineHeight: 0.9,
          color: 'var(--c-text)',
          margin: '0 0 1.5rem',
        }}>
          TOURNAMENT<br />
          <span style={{ color: 'var(--c-accent)', WebkitTextStroke: '0px' }}>26</span>
        </h1>

        {/* Sub-heading */}
        <p className="anim-2" style={{
          fontFamily: '"Crimson Text", serif',
          fontSize: '1.2rem',
          color: 'var(--c-muted)',
          maxWidth: '480px',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
        }}>
          Command your tournament from player registration to final standings.
          Track every round, every game, every player, every scenario.
        </p>

        {/* CTA */}
        <div className="anim-3" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {user ? (
            <Link to="/dashboard" className="btn-primary">→ Enter Command Center</Link>
          ) : (
            <>
              <Link to="/login" className="btn-primary">→ Begin Mission</Link>
              <Link to="/login" className="btn-secondary">Learn More</Link>
            </>
          )}
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', marginTop: '5rem', background: 'var(--c-border)' }}>
          {features.map((f, i) => (
            <div key={f.code} className={`anim-${i + 4}`} style={{
              background: 'var(--c-surface)',
              padding: '1.25rem 1.5rem',
            }}>
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.58rem', letterSpacing: '0.2em', color: 'var(--c-accent)', marginBottom: '0.6rem' }}>
                [{f.code}]
              </div>
              <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem', letterSpacing: '0.06em', color: 'var(--c-text)', margin: '0 0 0.5rem' }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.9rem', color: 'var(--c-muted)', margin: 0, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
