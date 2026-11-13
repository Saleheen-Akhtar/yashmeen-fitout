import axios from "axios";
import { tokenExpired } from "../lib/helpers";

export const itemPath = import.meta.env.VITE_ITEM_PATH || "/uploads";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
});

function getStoredUser() {
  try {
    const raw =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

api.interceptors.request.use(
  (config) => {
    const user = getStoredUser();
    const token = user?.token || user?.data?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const reqUrl = String(error?.config?.url || "");
    const message = error?.response?.data?.message || "";
    if (status === 401 && !reqUrl.includes("/account/login") && getStoredUser()) {
      tokenExpired(message);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post("/account/create", data),
  login: (data) => api.post("/account/login", data),
  logout: () => api.post("/account/logout"),
  getProfile: () => api.get("/account/profile"),
  forgotPassword: (data) => api.post("/account/forgot-password", data),
  resetPassword: (data) => api.post("/account/reset-password", data),
  resendVerification: (data) => api.post("/account/resend-verification", data),
};

export const bannerAPI = {
  create: (data) => api.post("/banner/create", data),
  getAll: () => api.get("/banner/getAll"),
  getActive: () => api.get("/banner/getActive"),
  status: (id) => api.patch(`/banner/status/${id}`),
  delete: (id) => api.delete(`/banner/delete/${id}`),
};

export const galleryAPI = {
  create: (data) => api.post("/gallery/create", data),
  getAll: (params) => api.get("/gallery/getAll", { params }),
  getById: (id) => api.get(`/gallery/getById/${id}`),
  update: (id, data) => api.put(`/gallery/update/${id}`, data),
  status: (id) => api.patch(`/gallery/status/${id}`),
  delete: (id) => api.delete(`/gallery/delete/${id}`),
};

export const popupAPI = {
  create: (data) => api.post("/popup/create", data),
  getAll: () => api.get("/popup/getAll"),
  getActive: () => api.get("/popup/getActive"),
  status: (id) => api.patch(`/popup/status/${id}`),
  delete: (id) => api.delete(`/popup/delete/${id}`),
};

export const categoryAPI = {
  create: (data) => api.post("/category/create", data),
  getAll: (params) => api.get("/category/getAll", { params }),
  status: (id) => api.patch(`/category/status/${id}`),
  update: (id, data) => api.put(`/category/update/${id}`, data),
  delete: (id) => api.delete(`/category/delete/${id}`),
};

export const projectAPI = {
  create: (data) => api.post("/project/create", data),
  getVersion: () => api.get("/project/version"),
  getAll: (params) => api.get("/project/getAll", { params }),
  getById: (id) => api.get(`/project/getById/${id}`),
  update: (id, data) => api.put(`/project/update/${id}`, data),
  delete: (id) => api.delete(`/project/delete/${id}`),
};

export const enquiryAPI = {
  create: (data) => api.post("/enquiry/create", data),
  getAll: () => api.get("/enquiry/getAll"),
  deleteOld: () => api.delete("/enquiry/delete/old"),
};

export const quoteAPI = {
  create: (data) => api.post("/quote/create", data),
  getAll: (params) => api.get("/quote/getAll", { params }),
  deleteOlderThanMonth: () => api.delete("/quote/delete/older-than-month"),
};

export const vacancyAPI = {
  create: (data) => api.post("/vacancy/create", data),
  getVersion: () => api.get("/vacancy/version"),
  getAll: () => api.get("/vacancy/getAll"),
  opens: () => api.get("/vacancy/opens"),
  getById: (id) => api.get(`/vacancy/getById/${id}`),
  update: (id, data) => api.put(`/vacancy/update/${id}`, data),
  status: (id, data) => api.patch(`/vacancy/status/${id}/status`, data),
  delete: (id) => api.delete(`/vacancy/delete/${id}`),
};

export const videoAPI = {
  create: (data) => api.post("/video/create", data),
  getVersion: () => api.get("/video/version"),
  getAll: () => api.get("/video/getAll"),
  getById: (id) => api.get(`/video/getById/${id}`),
  update: (id, data) => api.put(`/video/update/${id}`, data),
  status: (id) => api.patch(`/video/status/${id}`),
  delete: (id) => api.delete(`/video/delete/${id}`),
};

export const postAPI = {
  create: (data) => api.post("/post/create", data),
  getAll: () => api.get("/post/getAll"),
  getActivePosts: () => api.get("/post/getActivePosts"),
  getBy: (postId) => api.get(`/post/getBy/${postId}`),
  getBySlug: (slug) => api.get(`/post/getBySlug/${slug}`),
  update: (id, data) => api.put(`/post/update/${id}`, data),
  delete: (id) => api.delete(`/post/delete/${id}`),
  status: (id) => api.put(`/post/status/${id}`),
};

export const webDetailsAPI = {
  details: (data) => api.get("/webDetails/details", data),
  update: (data) => api.put("/webDetails/update", data),
};

export default api;
