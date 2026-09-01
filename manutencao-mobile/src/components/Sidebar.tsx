import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSidebar } from '../contexts/SidebarContext';
import { useAuth } from '../hooks/useAuth';
const sidebarRouteMap: Record<string, string> = {
  Dashboard: 'DashboardTab',
  Maquinas: 'MaquinasTab',
  Ordens: 'OrdensTab',
  Fornecedores: 'FornecedoresTab',
  Preventiva: 'PreventivaTab',
  Admin: 'AdminTab',
  Relatorios: 'AdminTab',
  Perfil: 'PerfilTab',
};

const tabInitialScreen: Record<string, string> = {
  MaquinasTab: 'MaquinaList',
  OrdensTab: 'OSList',
  FornecedoresTab: 'FornecedorList',
  PreventivaTab: 'PreventivaCalendar',
  AdminTab: 'AdminHome',
};

type SidebarItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  adminOnly?: boolean;
  coordOnly?: boolean;
};

const ITEMS: SidebarItem[] = [
  { key: 'Dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { key: 'Maquinas', label: 'Máquinas', icon: 'hardware-chip-outline' },
  { key: 'Ordens', label: 'Ordens de Serviço', icon: 'document-text-outline' },
  { key: 'Fornecedores', label: 'Fornecedores', icon: 'people-outline' },
  { key: 'Preventiva', label: 'Calendário', icon: 'calendar-outline' },
  { key: 'Admin', label: 'Administração', icon: 'shield-checkmark-outline', adminOnly: true },
  { key: 'Relatorios', label: 'Relatórios', icon: 'bar-chart-outline', coordOnly: true },
  { key: 'Perfil', label: 'Perfil', icon: 'person-outline' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(300, SCREEN_WIDTH * 0.8);

const Sidebar: React.FC = () => {
  const { open, close } = useSidebar();
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const filtered = ITEMS.filter(item => {
    if (item.adminOnly) return user?.role === 'ADMIN';
    if (item.coordOnly) return user?.role === 'COORD' || user?.role === 'ADMIN';
    return true;
  });

  const handlePress = (key: string) => {
    if (key === 'Relatorios') {
      navigation.navigate('AdminTab', { screen: 'Relatorios' });
    } else {
      const route = sidebarRouteMap[key];
      if (route) {
        const initial = tabInitialScreen[route];
        if (initial) {
          navigation.navigate(route, { screen: initial });
        } else {
          navigation.navigate(route);
        }
      }
    }
    close();
  };

  if (!open) return null;

  return (
    <>
      <TouchableOpacity activeOpacity={1} style={styles.backdrop} onPress={close} />
      <View style={styles.sidebar}>
        <View style={styles.header}>
          <Ionicons name="settings-outline" size={28} color="#1c1c1c" />
          <Text style={styles.title}>Manutenção</Text>
          <TouchableOpacity onPress={close} style={styles.closeBtn}>
            <Ionicons name="close-outline" size={28} color="#444" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.menu} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="always">
          {filtered.map(item => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              onPress={() => handlePress(item.key)}
            >
              <Ionicons name={item.icon} size={22} color="#444" />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1c1c1c', marginLeft: 12, flex: 1 },
  closeBtn: { padding: 8 },
  menu: { flex: 1, paddingVertical: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderRadius: 10,
    marginVertical: 2,
  },
  menuLabel: { fontSize: 15, color: '#444', marginLeft: 14, fontWeight: '500' },
});

export default Sidebar;
