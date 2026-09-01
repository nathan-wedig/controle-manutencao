import { Platform } from 'react-native';

const PORT = '8087';

const isWebProduction =
  Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  window.location.host !== `localhost:19006` &&
  window.location.host !== `localhost:8081`;

const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_BASE_URL = isWebProduction ? '' : `${envApiUrl || `http://localhost:${PORT}`}`;
export const FILES_BASE_URL = API_BASE_URL;
