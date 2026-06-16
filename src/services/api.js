import axios from "axios";

// Resolve base URL priority:
// 1. VITE_API_BASE_URL (set in Netlify or local .env)
// 2. When built for production, default to deployed backend URL
// 3. Fallback to local API for development
const resolvedBase =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (import.meta.env && import.meta.env.MODE === "production"
    ? "https://quizy-server-side.onrender.com/api"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL: resolvedBase,
  headers: { "Content-Type": "application/json" },
});

// Attach a lightweight dev user header from localStorage so backend optionalAuth
// can identify the current user without JWTs.
api.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem("dev_user");
      if (raw) {
        const u = JSON.parse(raw);
        if (u && u._id) {
          config.headers = config.headers || {};
          config.headers["x-user-id"] = u._id;
        }
        if (u && u.email) {
          config.headers = config.headers || {};
          config.headers["x-user-email"] = u.email;
        }
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
