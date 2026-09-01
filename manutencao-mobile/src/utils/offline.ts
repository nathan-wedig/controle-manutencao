import NetInfo from '@react-native-community/netinfo';
import { storage } from './storage';
import { ordensApi } from '../api/ordensServico';

export const isOnline = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
};

export const syncOfflineOS = async (): Promise<void> => {
  try {
    const online = await isOnline();
    if (!online) return;

    const pendingOS = await storage.getOfflineOS();
    if (pendingOS.length === 0) return;

    for (const os of pendingOS) {
      try {
        await ordensApi.criar(os);
        await storage.removeOfflineOS(os.id);
      } catch (error) {
        console.error('Erro ao sincronizar OS', os.id, error);
      }
    }
  } catch (error) {
    console.error('Erro na sincronização offline', error);
  }
};

export const saveOSOffline = async (osData: any): Promise<void> => {
  const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await storage.addOfflineOS({ ...osData, id: offlineId, offline: true });
};
