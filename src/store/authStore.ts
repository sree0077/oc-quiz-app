import { create } from 'zustand';
import { supabase } from '../config/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  isLoading: true,
  setSession: (session) => set({ session, isAuthenticated: !!session, isLoading: false }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, isAuthenticated: false });
  },
}));

// Initialize session listener
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setSession(session);
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});
