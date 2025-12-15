import axios from "axios";
import store from "../Store/store";
import {logout} from "../Store/authSlice"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});


api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      store.dispatch(logout());
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;