import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 120000, // Waking up can take up to 90 seconds
});

let wakeUpListener = null;

export function registerWakeUpListener(listener) {
  wakeUpListener = listener;
}

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aura_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Start 10s timer to detect if backend is sleeping
  const timer = setTimeout(() => {
    if (wakeUpListener) {
      wakeUpListener(true);
    }
  }, 10000);

  config.metadata = { timer };
  return config;
});

// Handle responses
api.interceptors.response.use(
  (res) => {
    if (res.config?.metadata?.timer) {
      clearTimeout(res.config.metadata.timer);
    }
    if (wakeUpListener) {
      wakeUpListener(false);
    }
    return res;
  },
  (err) => {
    if (err.config?.metadata?.timer) {
      clearTimeout(err.config.metadata.timer);
    }
    if (wakeUpListener) {
      wakeUpListener(false);
    }

    if (err.response?.status === 401) {
      localStorage.removeItem("aura_token");
      localStorage.removeItem("aura_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
