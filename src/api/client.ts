import axios from 'axios';
import router from '../router';
import { useAuthStore } from '../stores/auth';
import { supabase } from './supabase';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

client.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      await authStore.signOut();
      router.push('/login');
    }
    return Promise.reject(error);
  },
);

export default client;
