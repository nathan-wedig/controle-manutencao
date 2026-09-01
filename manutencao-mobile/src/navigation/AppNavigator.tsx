import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';
import Sidebar from '../components/Sidebar';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <NavigationContainer>
      {user ? (
        <SafeAreaView style={{ flex: 1 }}>
          <MainTabNavigator />
          <Sidebar />
        </SafeAreaView>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <AuthNavigator />
        </SafeAreaView>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
