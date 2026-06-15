import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 429) {
      return Promise.reject(new Error("Rate limit reached. Please wait a moment."));
    }
    if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK") {
      return Promise.reject(new Error("Connection timed out. Check your network."));
    }
    const msg = err.response?.data?.message;
    return Promise.reject(new Error(msg || "Something went wrong."));
  }
);

export default API;
