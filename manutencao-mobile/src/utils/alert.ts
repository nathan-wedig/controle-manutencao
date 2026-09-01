import { Alert, Platform } from 'react-native';

export const showAlert = (title: string, message?: string, buttons?: any[]) => {
  if (Platform.OS === 'web') {
    window.alert(message || title);
    return;
  }
  Alert.alert(title, message, buttons);
};
