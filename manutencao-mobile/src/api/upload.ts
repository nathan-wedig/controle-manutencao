import api from './client';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';
import { FILES_BASE_URL } from '../config';

export interface UploadResult {
  id: string;
  url: string;
  nomeOriginal: string;
  tipo: string;
  extensao: string;
  tamanho: number;
  categoria?: string;
  pastaId?: string;
  pastaNome?: string;
}

export const uploadApi = {
  upload: async (fileUri: string, fileName: string, fileType: string, categoria = 'geral', maquinaId?: string): Promise<UploadResult> => {
    if (Platform.OS === 'web') {
      const blob = await (await fetch(fileUri)).blob();
      const fd = new FormData();
      fd.append('file', blob, fileName);
      fd.append('categoria', categoria);
      if (maquinaId) fd.append('maquinaId', maquinaId);
      const token = await storage.getToken();
      const res = await fetch(FILES_BASE_URL + '/api/upload', {
        method: 'POST', body: fd,
        headers: { Authorization: token ? 'Bearer ' + token : '' },
      });
      if (!res.ok) throw new Error('Upload failed');
      return await res.json();
    }

    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: fileType
    } as any);
    formData.append('categoria', categoria);
    if (maquinaId) formData.append('maquinaId', maquinaId);
    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/api/upload/${id}`);
  },
};
