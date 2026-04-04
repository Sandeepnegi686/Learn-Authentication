import axios from "axios";

const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL;

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
};

const api = axios.create({
  baseURL: VITE_SERVER_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (
      config.method === "post" ||
      config.method === "put" ||
      config.method === "delete"
    ) {
      const csrfToken = getCookie("csrfToken");
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let isRefreshingCSRFToken = false;
let failedQueue = [];
let csrfFailedQueue = [];

const processQueue = (err, token = null) => {
  failedQueue.forEach((promise) => {
    if (err) {
      promise.rej(err);
    } else {
      promise.res(token);
    }
  });
  failedQueue = [];
};
const processCSRFQueue = (err, token = null) => {
  csrfFailedQueue.forEach((promise) => {
    if (err) {
      promise.rej(err);
    } else {
      promise.res(token);
    }
  });
  csrfFailedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
      const errorCode = error.response.data?.code || "";
      if (errorCode.startsWith("CSRF_")) {
        if (isRefreshingCSRFToken) {
          return new Promise((res, rej) => {
            csrfFailedQueue.push({ res, rej });
          }).then(() => api(originalRequest));
        }
        originalRequest._retry = true;
        isRefreshingCSRFToken = true;

        try {
          await api.post("/api/v1/refresh-csrf");
          processCSRFQueue(null);
          return api(originalRequest);
        } catch (error) {
          processCSRFQueue(error);
          console.log("Failed to refresh CSRF token", error);
          return Promise.reject(error);
        } finally {
          isRefreshingCSRFToken = false;
        }
      }
      if (isRefreshing) {
        return new Promise((res, rej) => {
          failedQueue.push({ res, rej });
        }).then(() => {
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post("/api/v1/refresh");
        processQueue(null);
        return api(originalRequest);
      } catch (error) {
        console.log(error);
        processQueue(error, null);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default api;
