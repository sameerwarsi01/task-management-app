import axios from 'axios';
import { createClient } from './supabaseClient';

const supabase = createClient();

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:5000',
});

API.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (session?.access_token && !refreshError) {
        originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
        return API(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export default API;