import api from './client';
import { OrdemServico, PageResponse } from '../types';

export const ordensApi = {
  listar: async (): Promise<OrdemServico[]> => {
    const response = await api.get('/api/ordens-servico?size=10000');
    return response.data.content ?? response.data;
  },

  buscarPorId: async (id: string): Promise<OrdemServico> => {
    const response = await api.get(`/api/ordens-servico/${id}`);
    return response.data;
  },

  buscarPorMaquina: async (maquinaId: string, page: number = 0, size: number = 5): Promise<PageResponse<OrdemServico>> => {
    const response = await api.get(`/api/ordens-servico/maquina/${maquinaId}`, {
      params: { page, size, sort: 'dataAbertura,desc' },
    });
    return response.data;
  },

  buscarPorTecnico: async (tecnicoId: string): Promise<OrdemServico[]> => {
    const response = await api.get(`/api/ordens-servico/tecnico/${tecnicoId}`);
    return response.data;
  },

  buscarPorStatus: async (status: string): Promise<OrdemServico[]> => {
    const response = await api.get(`/api/ordens-servico/status/${status}`);
    return response.data;
  },

  criar: async (data: Partial<OrdemServico>): Promise<OrdemServico> => {
    const response = await api.post('/api/ordens-servico', data);
    return response.data;
  },

  atualizar: async (id: string, data: Partial<OrdemServico>): Promise<OrdemServico> => {
    const response = await api.put(`/api/ordens-servico/${id}`, data);
    return response.data;
  },

  concluir: async (id: string, data: Partial<OrdemServico>): Promise<OrdemServico> => {
    const response = await api.put(`/api/ordens-servico/${id}/concluir`, data);
    return response.data;
  },

  iniciar: async (id: string): Promise<void> => {
    await api.put(`/api/ordens-servico/${id}/iniciar`);
  },

  cancelar: async (id: string): Promise<void> => {
    await api.put(`/api/ordens-servico/${id}/cancelar`);
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/api/ordens-servico/${id}`);
  },

  associarAnexo: async (id: string, anexoId: string): Promise<void> => {
    await api.post(`/api/ordens-servico/${id}/anexos/${anexoId}`);
  },

  removerAnexo: async (id: string, anexoId: string): Promise<void> => {
    await api.delete(`/api/ordens-servico/${id}/anexos/${anexoId}`);
  },
};
