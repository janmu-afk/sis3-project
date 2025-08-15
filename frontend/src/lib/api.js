import axios from "axios";
import { API_BASE_URL } from "../config";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // keep if using cookie-based auth; remove if not
  timeout: 60000 // sorry
});

// If you use token auth instead of cookies, uncomment:
// api.interceptors.request.use((cfg) => {
//   const token = window.sessionStorage.getItem("access_token");
//   if (token) cfg.headers.Authorization = `Bearer ${token}`;
//   return cfg;
// });