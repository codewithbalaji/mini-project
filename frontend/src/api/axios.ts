import axios from "axios";

/*
  Create a reusable Axios instance.
  This prevents repeating the base URL everywhere.
*/
const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

/*
  Axios interceptor runs BEFORE every request.
  We attach the JWT token automatically here.
*/
api.interceptors.request.use((config) => {

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;