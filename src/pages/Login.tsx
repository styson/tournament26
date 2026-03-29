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

  async function handleGoogle() {
    setError('');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--c-bg)',
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
        backgroundImage: 'radial-gradient(circle, var(--c-raised) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        opacity: 0.8,
        pointerEvents: 'none',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, var(--c-bg) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '380px' }}>

        {/* Header */}
        <div className="anim-0" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', background: 'var(--c-accent)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))', marginBottom: '1rem' }}>
            <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '1.5rem', color: 'var(--c-bg)', letterSpacing: '0.05em' }}>T</span>
          </div>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '2.2rem', letterSpacing: '0.1em', color: 'var(--c-text)', margin: 0 }}>
            TOURNEY<span style={{ color: 'var(--c-accent)' }}>26</span>
          </h1>
          <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--c-muted)', textTransform: 'uppercase', marginTop: '0.4rem' }}>
            Secure Access Required
          </p>
        </div>

        {/* Card */}
        <div className="card anim-1" style={{ padding: '1.75rem' }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid var(--c-border)' }}>
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setInfo(''); }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: mode === m ? '2px solid var(--c-accent)' : '2px solid transparent',
                  color: mode === m ? 'var(--c-accent)' : 'var(--c-muted)',
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: '0.65rem',
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
              <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(139, 46, 46, 0.15)', border: '1px solid var(--c-red-border)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--c-red)', letterSpacing: '0.05em' }}>
                {error}
              </div>
            )}

            {info && (
              <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(58, 92, 56, 0.15)', border: '1px solid var(--c-green)', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem', color: 'var(--c-green)', letterSpacing: '0.05em' }}>
                {info}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.6 : 1, cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? 'Processing...' : mode === 'signin' ? 'Enter Command' : 'Enlist'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--c-border)' }} />
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.6rem', color: 'var(--c-muted-dim)', letterSpacing: '0.15em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--c-border)' }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.58rem', color: 'var(--c-muted-dim)', letterSpacing: '0.12em', marginTop: '1.25rem', textTransform: 'uppercase' }}>
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
