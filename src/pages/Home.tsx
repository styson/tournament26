import { Link } from '@tanstack/react-router';
import { useAuth } from '@/config/auth';

const features = [
  {
    code: '01',
    title: 'Player Roster',
    desc: 'Maintain complete records — history, W/L records, opponent strength.',
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
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Scanlines CRT overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.045) 2px, rgba(0,0,0,0.045) 4px)',
        pointerEvents: 'none',
        zIndex: 3,
      }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, var(--color-raised) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Radar — positioned to right side */}
      <div style={{
        position: 'absolute',
        right: '-2%',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '680px',
        height: '680px',
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        {/* Concentric rings */}
        {[72, 150, 240, 340, 450].map((r, i) => (
          <div key={r} style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: r * 2, height: r * 2,
            marginTop: -r, marginLeft: -r,
            borderRadius: '50%',
            border: `1px solid rgba(240,160,32,${(0.22 - i * 0.037).toFixed(3)})`,
          }} />
        ))}
        {/* Crosshair H */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', marginTop: '-0.5px', background: 'rgba(240,160,32,0.09)' }} />
        {/* Crosshair V */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', marginLeft: '-0.5px', background: 'rgba(240,160,32,0.09)' }} />

        {/* Conic sweep gradient — rotates as a whole */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, rgba(240,160,32,0.04) 330deg, rgba(240,160,32,0.14) 355deg, rgba(240,160,32,0.22) 360deg)',
          animation: 'radarSweep 8s linear infinite',
          overflow: 'hidden',
        }} />

        {/* Sweep tip: half-line with glowing dot at tip */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '50%',
          height: '1px',
          marginTop: '-0.5px',
          transformOrigin: '0 50%',
          animation: 'radarSweep 8s linear infinite',
        }}>
          <div style={{
            position: 'absolute',
            right: 0,
            top: '-4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'rgba(240,160,32,0.9)',
            boxShadow: '0 0 10px 3px rgba(240,160,32,0.5)',
          }} />
        </div>
      </div>

      {/* Radial vignette — masks radar toward the content */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 68% 50%, transparent 28%, var(--color-bg) 72%)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* Diagonal accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '47%',
        width: '1px',
        height: '100%',
        background: 'linear-gradient(180deg, transparent 0%, var(--color-border) 20%, var(--color-border) 80%, transparent 100%)',
        transform: 'skewX(-8deg)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      <div style={{ position: 'relative', zIndex: 4, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>

        {/* Status label with blinking dot + pulse ring */}
        <div className="anim-0" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)', animation: 'blink 1.4s step-end infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--color-accent)', animation: 'pulseRing 1.4s ease-out infinite' }} />
          </div>
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.25em', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
            Tournament Director Platform · System Online
          </span>
        </div>

        {/* Hero heading */}
        <h1 className="anim-1" style={{
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: 'clamp(4rem, 12vw, 9rem)',
          letterSpacing: '0.06em',
          lineHeight: 0.88,
          color: 'var(--color-text)',
          margin: '0 0 1.5rem',
        }}>
          COMMAND<br />
          <span style={{
            color: 'transparent',
            WebkitTextStroke: '2px var(--color-accent)',
            opacity: 0.7,
          }}>YOUR</span><br />
          <span style={{ color: 'var(--color-accent)' }}>TOURNAMENT</span>
        </h1>

        {/* Designation line */}
        <div className="anim-2" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ height: '1px', width: '2rem', background: 'var(--color-accent)', opacity: 0.6 }} />
          <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.58rem', letterSpacing: '0.28em', color: 'var(--color-accent)', textTransform: 'uppercase', opacity: 0.7 }}>
            Designation: TOURNEY-26
          </span>
        </div>

        {/* Sub-heading */}
        <p className="anim-2" style={{
          fontFamily: '"Crimson Text", serif',
          fontSize: '1.2rem',
          color: 'var(--color-muted)',
          maxWidth: '460px',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', marginTop: '5rem', background: 'var(--color-border)' }}>
          {features.map((f, i) => (
            <div key={f.code} className={`anim-${i + 4}`} style={{
              background: 'var(--color-surface)',
              padding: '1.25rem 1.5rem',
              position: 'relative',
              overflow: 'hidden',
              transition: 'background 0.2s ease',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--color-raised)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--color-surface)'}
            >
              {/* Top accent bar */}
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, var(--color-accent), transparent 75%)',
              }} />
              <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.58rem', letterSpacing: '0.2em', color: 'var(--color-accent)', marginBottom: '0.6rem' }}>
                [{f.code}]
              </div>
              <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.3rem', letterSpacing: '0.06em', color: 'var(--color-text)', margin: '0 0 0.5rem' }}>
                {f.title}
              </h3>
              <p style={{ fontFamily: '"Crimson Text", serif', fontSize: '0.9rem', color: 'var(--color-muted)', margin: 0, lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
