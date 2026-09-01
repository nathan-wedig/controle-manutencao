import axios from 'axios';
import { storage } from '../utils/storage';
import { triggerLogout } from '../utils/authCallback';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clear();
      triggerLogout();
    }
    return Promise.reject(error);
  }
);

export default api;
