import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

import BackButton from '../components/BackButton';
import MenuButton from '../components/MenuButton';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import MaquinaListScreen from '../screens/maquinas/MaquinaListScreen';
import MaquinaDetailScreen from '../screens/maquinas/MaquinaDetailScreen';
import MaquinaFormScreen from '../screens/maquinas/MaquinaFormScreen';
import QRCodeScannerScreen from '../screens/maquinas/QRCodeScannerScreen';
import OSListScreen from '../screens/ordens/OSListScreen';
import OSDetailScreen from '../screens/ordens/OSDetailScreen';
import OSFormScreen from '../screens/ordens/OSFormScreen';
import ProfileScreen from '../screens/perfil/ProfileScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import RelatorioScreen, { CustoRelatorio, MaquinaRelatorio, MaquinaOSRelatorio } from '../screens/admin/RelatorioScreen';
import SetorListScreen from '../screens/admin/SetorListScreen';
import FornecedorListScreen from '../screens/fornecedores/FornecedorListScreen';
import FornecedorFormScreen from '../screens/fornecedores/FornecedorFormScreen';
import PreventivaCalendarScreen from '../screens/preventiva/PreventivaCalendarScreen';
import PreventivaFormScreen from '../screens/preventiva/PreventivaFormScreen';

export type MaquinasStackParamList = {
  MaquinaList: undefined;
  MaquinaDetail: { id: string };
  MaquinaForm: { id?: string };
  QRCodeScanner: undefined;
};

export type OrdensStackParamList = {
  OSList: undefined;
  OSDetail: { id: string; fromMaquinaId?: string };
  OSForm: { id?: string; planoPreventivaId?: string; maquinaId?: string; fromMaquinaId?: string; tipo?: string; preventivaNome?: string; preventivaObservacoes?: string } | undefined;
};

export type AdminStackParamList = {
  AdminHome: undefined;
  Relatorios: undefined;
  RelatorioCusto: undefined;
  RelatorioMaquinas: undefined;
  RelatorioMaquinasOS: undefined;
  Setores: undefined;
};

export type FornecedoresStackParamList = {
  FornecedorList: undefined;
  FornecedorForm: { id?: string };
};

export type PreventivaStackParamList = {
  PreventivaCalendar: undefined;
  PreventivaForm: { id?: string };
};

type MainTabParamList = {
  DashboardTab: undefined;
  MaquinasTab: undefined;
  OrdensTab: undefined;
  FornecedoresTab: undefined;
  PreventivaTab: undefined;
  AdminTab: undefined;
  PerfilTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const MaquinasStack = createNativeStackNavigator<MaquinasStackParamList>();
const OrdensStack = createNativeStackNavigator<OrdensStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();
const FornecedoresStack = createNativeStackNavigator<FornecedoresStackParamList>();
const PreventivaStack = createNativeStackNavigator<PreventivaStackParamList>();

const headerOpts = {
  headerStyle: { backgroundColor: '#1c1c1c' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' as const },
};

const headerOptsWithMenu = {
  ...headerOpts,
  headerLeft: () => <MenuButton />,
};

const withBack = (title: string) => ({
  title,
  headerLeft: () => <MenuButton />,
  headerRight: () => <BackButton />,
});

const MaquinasNavigator = () => (
  <MaquinasStack.Navigator screenOptions={headerOpts}>
    <MaquinasStack.Screen name="MaquinaList" component={MaquinaListScreen} options={{ title: 'Máquinas', ...headerOptsWithMenu }} />
    <MaquinasStack.Screen name="MaquinaDetail" component={MaquinaDetailScreen} options={withBack('Detalhes')} />
    <MaquinasStack.Screen name="MaquinaForm" component={MaquinaFormScreen} options={withBack('Nova Máquina')} />
    <MaquinasStack.Screen name="QRCodeScanner" component={QRCodeScannerScreen} options={withBack('Escanear QRCode')} />
  </MaquinasStack.Navigator>
);

const OrdensNavigator = () => (
  <OrdensStack.Navigator screenOptions={headerOpts}>
    <OrdensStack.Screen name="OSList" component={OSListScreen} options={{ title: 'Ordens de Serviço', ...headerOptsWithMenu }} />
    <OrdensStack.Screen name="OSDetail" component={OSDetailScreen} options={withBack('Detalhes OS')} />
    <OrdensStack.Screen name="OSForm" component={OSFormScreen} options={withBack('Nova OS')} />
  </OrdensStack.Navigator>
);

const AdminNavigator: React.FC = () => {
  const { user } = useAuth();
  const isCoord = user?.role === 'COORD';
  return (
    <AdminStack.Navigator screenOptions={headerOpts} initialRouteName={isCoord ? 'Relatorios' : 'AdminHome'}>
      <AdminStack.Screen name="AdminHome" component={AdminScreen} options={{ title: 'Admin', ...headerOptsWithMenu }} />
      <AdminStack.Screen name="Relatorios" component={RelatorioScreen} options={withBack('Relatórios')} />
      <AdminStack.Screen name="RelatorioCusto" component={CustoRelatorio} options={withBack('Relatório de Custos')} />
      <AdminStack.Screen name="RelatorioMaquinas" component={MaquinaRelatorio} options={withBack('Relatório Máquinas')} />
      <AdminStack.Screen name="RelatorioMaquinasOS" component={MaquinaOSRelatorio} options={withBack('Relatório OS por Máquina')} />
      <AdminStack.Screen name="Setores" component={SetorListScreen} options={withBack('Setores')} />
    </AdminStack.Navigator>
  );
};

const FornecedoresNavigator = () => (
  <FornecedoresStack.Navigator screenOptions={headerOpts}>
    <FornecedoresStack.Screen name="FornecedorList" component={FornecedorListScreen} options={{ title: 'Fornecedores/Terceiros', ...headerOptsWithMenu }} />
    <FornecedoresStack.Screen name="FornecedorForm" component={FornecedorFormScreen} options={withBack('Fornecedor')} />
  </FornecedoresStack.Navigator>
);

const PreventivaNavigator = () => (
  <PreventivaStack.Navigator screenOptions={headerOpts}>
    <PreventivaStack.Screen name="PreventivaCalendar" component={PreventivaCalendarScreen} options={{ title: 'Calendário', ...headerOptsWithMenu }} />
    <PreventivaStack.Screen name="PreventivaForm" component={PreventivaFormScreen} options={withBack('Ação Preventiva')} />
  </PreventivaStack.Navigator>
);

const MainTabNavigator = () => {
  const { user } = useAuth();
  const isAdminOrCoord = user?.role === 'ADMIN' || user?.role === 'COORD';
  const adminLabel = user?.role === 'COORD' ? 'Relatórios' : 'Admin';
  const adminIcon = user?.role === 'COORD' ? 'bar-chart-outline' as const : 'shield-checkmark-outline' as const;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            DashboardTab: 'grid-outline',
            MaquinasTab: 'hardware-chip-outline',
            OrdensTab: 'document-text-outline',
            FornecedoresTab: 'people-outline',
            PreventivaTab: 'calendar-outline',
            AdminTab: adminIcon,
            PerfilTab: 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1c1c1c',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 12 },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard', headerShown: true, ...headerOptsWithMenu }} />
      <Tab.Screen name="MaquinasTab" component={MaquinasNavigator} options={{ title: 'Máquinas' }} />
      <Tab.Screen name="OrdensTab" component={OrdensNavigator} options={{ title: 'OS' }} />
      <Tab.Screen name="FornecedoresTab" component={FornecedoresNavigator} options={{ title: 'Fornecedores/Terceiros' }} />
      <Tab.Screen name="PreventivaTab" component={PreventivaNavigator} options={{ title: 'Calendário' }} />
      {isAdminOrCoord && <Tab.Screen name="AdminTab" component={AdminNavigator} options={{ title: adminLabel }} />}
      <Tab.Screen name="PerfilTab" component={ProfileScreen} options={{ title: 'Perfil', headerShown: true, ...headerOptsWithMenu }} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
