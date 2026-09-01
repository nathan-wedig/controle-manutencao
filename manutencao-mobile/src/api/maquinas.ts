import api from './client';
import { Maquina, Pasta } from '../types';

export const maquinasApi = {
  listar: async (): Promise<Maquina[]> => {
    const response = await api.get('/api/maquinas', { params: { size: 10000 } });
    return response.data.content ?? response.data;
  },

  buscarPorId: async (id: string): Promise<Maquina> => {
    const response = await api.get(`/api/maquinas/${id}`);
    return response.data;
  },

  buscarPorCodigo: async (codigo: string): Promise<Maquina> => {
    const response = await api.get(`/api/maquinas/codigo/${codigo}`);
    return response.data;
  },

  buscarPorQrcode: async (hash: string): Promise<Maquina> => {
    const response = await api.get(`/api/maquinas/qrcode/${hash}`);
    return response.data;
  },

  criar: async (data: Partial<Maquina>): Promise<Maquina> => {
    const response = await api.post('/api/maquinas', data);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<Maquina>): Promise<Maquina> => {
    const response = await api.put(`/api/maquinas/${id}`, data);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/api/maquinas/${id}`);
  },

  associarAnexos: async (id: string, anexoIds: string[]): Promise<void> => {
    await api.put(`/api/maquinas/${id}/anexos`, anexoIds);
  },

  listarFornecedores: async (id: string): Promise<any[]> => {
    const response = await api.get(`/api/maquinas/${id}/fornecedores`);
    return response.data;
  },

  listarPastas: async (id: string): Promise<Pasta[]> => {
    const response = await api.get(`/api/maquinas/${id}/pastas`);
    return response.data;
  },

  criarPasta: async (id: string, nome: string): Promise<Pasta> => {
    const response = await api.post(`/api/maquinas/${id}/pastas`, null, { params: { nome } });
    return response.data;
  },

  deletarPasta: async (id: string, pastaId: string): Promise<void> => {
    await api.delete(`/api/maquinas/${id}/pastas/${pastaId}`);
  },

  moverAnexo: async (id: string, anexoId: string, pastaId?: string): Promise<void> => {
    await api.put(`/api/maquinas/${id}/anexos/${anexoId}/mover`, null, { params: { pastaId } });
  },

  relatorio: async (params?: { search?: string; setor?: string; status?: string }): Promise<Maquina[]> => {
    const response = await api.get('/api/maquinas/relatorio', { params });
    return response.data;
  },
};
