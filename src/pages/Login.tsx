import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/config/auth';

type Mode = 'signin' | 'signup';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: '/dashboard' });
  }, [user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        setInfo('Check your email to confirm your account.');
      }
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

          {/* Mode toggle */}
          <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setInfo(''); }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: mode === m ? '2px solid var(--color-accent)' : '2px solid transparent',
                  color: mode === m ? 'var(--color-accent)' : 'var(--color-muted)',
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.8rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  marginBottom: '-1px',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {mode === 'signup' && (
              <div>
                <label className="field-label">Full Name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Lt. John Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            )}

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
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>

            {error && (
              <div className="error-box">{error}</div>
            )}

            {info && (
              <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(58, 92, 56, 0.15)', border: '1px solid var(--color-green)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--color-green)', letterSpacing: '0.05em' }}>
                {info}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? 'Processing...' : mode === 'signin' ? 'Enter HQ' : 'Log In'}
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
