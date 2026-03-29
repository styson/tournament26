import './index.css';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { supabase } from './config/supabase';
import { useAuthStore } from './store/authStore';
import type { User } from '@supabase/supabase-js';
import App from './App.tsx';

function mapUser(su: User) {
  return {
    id: su.id,
    email: su.email,
    name: su.user_metadata?.full_name ?? su.user_metadata?.name ?? su.email,
  };
}

// Restore session before first render
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setUser(session?.user ? mapUser(session.user) : null);
  useAuthStore.getState().setLoading(false);
});

// Keep auth state in sync (OAuth redirects, token refresh, sign-out)
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setUser(session?.user ? mapUser(session.user) : null);
  useAuthStore.getState().setLoading(false);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
