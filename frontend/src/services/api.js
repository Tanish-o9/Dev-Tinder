import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Normalize every failed response into a plain Error with a readable .message.
// Callers catch a single shape: err.message — no more drilling into err.response.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const data = err.response?.data;
    const message =
      data?.message ||
      (typeof data === "string" && data) ||
      err.message ||
      "Something went wrong";
    if (status === 401 && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    const normalized = new Error(message);
    normalized.status = status;
    normalized.data = data;
    return Promise.reject(normalized);
  }
);

export default api;
