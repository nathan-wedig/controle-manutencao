import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { SidebarProvider } from './src/contexts/SidebarContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SidebarProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </SidebarProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
