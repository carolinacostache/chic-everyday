import axios from "axios";

const API_URL = import.meta.env.VITE_API_ENDPOINT || "http://localhost:8800/api";

const apiRequest = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default apiRequest;