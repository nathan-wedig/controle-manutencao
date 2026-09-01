import api from './client';
import { Fornecedor } from '../types';

export const fornecedoresApi = {
  listar: async (): Promise<Fornecedor[]> => {
    const response = await api.get('/api/fornecedores');
    return response.data.content ?? response.data;
  },

  search: async (q: string): Promise<Fornecedor[]> => {
    const response = await api.get('/api/fornecedores/search', { params: { q } });
    return response.data.content ?? response.data;
  },

  buscarPorId: async (id: string): Promise<Fornecedor> => {
    const response = await api.get(`/api/fornecedores/${id}`);
    return response.data;
  },

  criar: async (data: Partial<Fornecedor>): Promise<Fornecedor> => {
    const response = await api.post('/api/fornecedores', data);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<Fornecedor>): Promise<Fornecedor> => {
    const response = await api.put(`/api/fornecedores/${id}`, data);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/api/fornecedores/${id}`);
  },
};
