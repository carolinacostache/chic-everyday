import axios from "axios";

const API_URL = import.meta.env.VITE_API_ENDPOINT || "http://localhost:3000";

const apiRequest = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default apiRequest;