import axios from 'axios';
import { API_BASE_URL } from '@/lib/constants';

let isLoggingOut = false;

export function setLoggingOut(value: boolean) {
  isLoggingOut = value;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const tokens = getTokens();
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isLoggingOut) return Promise.reject(error);

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = getTokens();
        if (tokens?.refresh) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: tokens.refresh,
          });

          const { access, refresh } = response.data.data;
          setTokens({ access, refresh });
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch {
        clearTokens();
        if (!isLoggingOut) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

function getTokens() {
  try {
    const stored = localStorage.getItem('b2b_tokens');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setTokens(tokens: { access: string; refresh: string }) {
  localStorage.setItem('b2b_tokens', JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem('b2b_tokens');
}

export { api, getTokens, setTokens, clearTokens };
export default api;
