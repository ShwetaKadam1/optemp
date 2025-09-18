// lib/apiClient.js
import axios from "axios";
import { auth } from "./firebaseClient"; // ✅ use initialized auth from firebaseClient

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

// Add Firebase ID token to every request
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
