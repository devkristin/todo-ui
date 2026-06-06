import { supabase } from '@/api/supabase';
import { defineStore } from 'pinia';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },

  actions: {
    async init() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        this.token = data.session.access_token;
        this.user = data.session.user;
      }
    },

    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        this.token = data.session.access_token;
        this.user = data.session.user;
      } catch (err: any) {
        this.error = err.message || 'Login failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      } catch (err: any) {
        this.error = err.message || 'Registration failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async signOut() {
      await supabase.auth.signOut();
      this.user = null;
      this.token = null;
      this.error = null;
    },
  },
});
