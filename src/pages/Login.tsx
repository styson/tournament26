import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/config/auth';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: '/dashboard' });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message ?? 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot-grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, var(--color-raised) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        opacity: 0.8,
        pointerEvents: 'none',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, var(--color-bg) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '380px' }}>

        {/* Header */}
        <div className="anim-0" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', background: 'var(--color-accent)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))', marginBottom: '1rem' }}>
            <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.5rem', color: 'var(--color-bg)', letterSpacing: '0.05em' }}>T</span>
          </div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.2rem', letterSpacing: '0.1em', color: 'var(--color-text)', margin: 0 }}>
            TOURNEY<span style={{ color: 'var(--color-accent)' }}>26</span>
          </h1>
          <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--color-muted)', textTransform: 'uppercase', marginTop: '0.4rem' }}>
            Secure Access Required
          </p>
        </div>

        {/* Card */}
        <div className="card anim-1" style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div>
              <label className="field-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="commander@unit.mil"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="error-box">{error}</div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? 'Processing...' : 'Enter HQ'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.58rem', color: 'var(--color-muted-dim)', letterSpacing: '0.12em', marginTop: '1.25rem', textTransform: 'uppercase' }}>
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
