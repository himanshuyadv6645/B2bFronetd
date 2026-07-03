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

// Single-flight token refresh: the backend rotates + blacklists refresh tokens,
// so multiple concurrent 401s must NOT each call /token/refresh/ (only the first
// would succeed; the rest would use the now-blacklisted token and log the user
// out). Instead we run ONE refresh and let other pending requests await it.
let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

function notifyRefreshed(token: string | null) {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
}

api.interceptors.response.use(
  (response) => {
    // The backend nests pagination under `data.pagination.{count,total_pages,...}`.
    // Hoist those onto the top level so callers reading `data.count` / `data.total_pages`
    // work (otherwise counts show 0 and "Next" pagination stays disabled).
    const d = response.data;
    if (d && typeof d === 'object' && d.pagination && typeof d.pagination === 'object') {
      if (d.count === undefined) d.count = d.pagination.count;
      if (d.total_pages === undefined) d.total_pages = d.pagination.total_pages;
      if (d.next === undefined) d.next = d.pagination.next;
      if (d.previous === undefined) d.previous = d.pagination.previous;
    }
    return response;
  },
  async (error) => {
    if (isLoggingOut) return Promise.reject(error);

    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      const tokens = getTokens();
      if (!tokens?.refresh) return Promise.reject(error);

      // A refresh is already in flight — wait for it, then retry with the new token.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshWaiters.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: tokens.refresh,
        });

        const { access, refresh } = response.data.data;
        // Keep the old refresh token if the backend didn't rotate one this time.
        setTokens({ access, refresh: refresh ?? tokens.refresh });
        isRefreshing = false;
        notifyRefreshed(access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch {
        isRefreshing = false;
        notifyRefreshed(null);
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
