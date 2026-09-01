import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@manutencao_token',
  USER: '@manutencao_user',
  OFFLINE_OS: '@manutencao_offline_os',
};

export const storage = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.TOKEN);
  },

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.TOKEN);
  },

  async getUser(): Promise<any | null> {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  async setUser(user: any): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  async getOfflineOS(): Promise<any[]> {
    const data = await AsyncStorage.getItem(KEYS.OFFLINE_OS);
    return data ? JSON.parse(data) : [];
  },

  async addOfflineOS(os: any): Promise<void> {
    const list = await this.getOfflineOS();
    list.push(os);
    await AsyncStorage.setItem(KEYS.OFFLINE_OS, JSON.stringify(list));
  },

  async removeOfflineOS(id: string): Promise<void> {
    const list = await this.getOfflineOS();
    const filtered = list.filter((item: any) => item.id !== id);
    await AsyncStorage.setItem(KEYS.OFFLINE_OS, JSON.stringify(filtered));
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
