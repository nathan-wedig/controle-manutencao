import api from './client';
import { LoginResponse } from '../types';

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },

  register: async (data: any): Promise<any> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },
};
