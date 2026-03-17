import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json"
  }
});

// Gắn access_token vào mỗi request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Biến tránh gọi refresh nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Nếu 401 và chưa thử refresh
    if (err.response?.status === 401 && !originalRequest._retry) {
      
      // Nếu đang refresh rồi, cho request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // Không có refresh token → logout
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(err);
      }

      try {
        // Gọi API refresh
        const res = await axios.post(
          "http://127.0.0.1:8000/auth/refresh",
          { refresh_token: refreshToken }  // body
        );

        const newAccessToken = res.data.access_token;
        localStorage.setItem("access_token", newAccessToken);

        // Cập nhật header và retry request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return axiosClient(originalRequest);

      } catch (refreshErr) {
        // Refresh token cũng hết hạn → logout
        processQueue(refreshErr, null);
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshErr);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default axiosClient;
