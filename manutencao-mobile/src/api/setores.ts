import api from './client';

export interface Setor {
  id: string;
  nome: string;
  descricao: string;
}

export const setoresApi = {
  listar: async (): Promise<Setor[]> => {
    const response = await api.get('/api/setores');
    return response.data;
  },

  criar: async (data: { nome: string; descricao?: string }): Promise<Setor> => {
    const response = await api.post('/api/setores', data);
    return response.data;
  },

  atualizar: async (id: string, data: { nome: string; descricao?: string }): Promise<Setor> => {
    const response = await api.put(`/api/setores/${id}`, data);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/api/setores/${id}`);
  },
};
