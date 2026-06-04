import axios from "axios";
import { jwtDecode } from "jwt-decode";

// const baseURL = "http://localhost:8080/api";
const baseURL = import.meta.env.VITE_API_URL;

const axiosRefresh = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (config.headers?.skipAuth) {
      delete config.headers.skipAuth;
      return config;
    }

    const token = localStorage.getItem("adminAccessToken")?.trim();
    if (token) {
      try {
        const payload = jwtDecode(token);
        if (payload.exp * 1000 - 10000 < Date.now()) {
          const rfToken = localStorage.getItem("adminRefreshToken")?.trim();
          const res = await axiosRefresh.post("/auth/refresh-token", {
            refreshToken: rfToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;

          localStorage.setItem("adminAccessToken", accessToken.trim());
          if (newRefreshToken) {
            localStorage.setItem("adminRefreshToken", newRefreshToken.trim());
          }
          config.headers["Authorization"] = `Bearer ${accessToken.trim()}`;
        } else {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Lỗi refreshing token:", error);
        localStorage.removeItem("adminAccessToken");
        localStorage.removeItem("adminRefreshToken");
        window.location.href = "/";
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => {
    console.log("Lỗi request interceptor:", error);
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminAccessToken");
      localStorage.removeItem("adminRefreshToken");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
