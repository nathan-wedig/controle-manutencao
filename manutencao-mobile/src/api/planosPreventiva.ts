import api from './client';
import { PlanoPreventiva } from '../types';

export const planosPreventivaApi = {
  listar: async (): Promise<PlanoPreventiva[]> => {
    const response = await api.get('/api/planos-preventiva');
    return response.data.content ?? response.data;
  },

  buscarPorId: async (id: string): Promise<PlanoPreventiva> => {
    const response = await api.get(`/api/planos-preventiva/${id}`);
    return response.data;
  },

  buscarPorMaquina: async (maquinaId: string): Promise<PlanoPreventiva[]> => {
    const response = await api.get(`/api/planos-preventiva/maquina/${maquinaId}`);
    return response.data;
  },

  buscarProximos: async (dias: number = 30): Promise<PlanoPreventiva[]> => {
    const response = await api.get('/api/planos-preventiva/proximos', { params: { dias } });
    return response.data;
  },

  criar: async (data: Partial<PlanoPreventiva>): Promise<PlanoPreventiva> => {
    const response = await api.post('/api/planos-preventiva', data);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<PlanoPreventiva>): Promise<PlanoPreventiva> => {
    const response = await api.put(`/api/planos-preventiva/${id}`, data);
    return response.data;
  },

  executar: async (id: string): Promise<void> => {
    await api.put(`/api/planos-preventiva/${id}/executar`);
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/api/planos-preventiva/${id}`);
  },
};
