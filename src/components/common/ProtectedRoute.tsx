import type { ReactNode } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useAuth } from '@/config/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--c-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid var(--c-spin-track)',
            borderTopColor: 'var(--c-accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto',
          }} />
          <p style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'var(--c-muted)', marginTop: '1rem', textTransform: 'uppercase' }}>
            Authenticating...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
