import { supabase } from './supabase';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, loading } = useAuthStore();

  async function signOut() {
    await supabase.auth.signOut();
  }

  return { user, loading, signOut };
}
