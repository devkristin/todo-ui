import { defineStore } from 'pinia';
import client from '../api/client';

export interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await client.post('/auth/login', { email, password });

        this.token = response.data.access_token;
        this.user = response.data.user;

        if (this.token && this.user) {
          localStorage.setItem('token', this.token);
          localStorage.setItem('user', JSON.stringify(this.user));
        }
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Login failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        await client.post('/auth/register', { email, password });
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Registration failed';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    signOut() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});
