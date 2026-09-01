import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Deseja sair do sistema?')) signOut();
    } else {
      Alert.alert('Sair', 'Deseja sair do sistema?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => signOut() },
      ]);
    }
  };

  const items = [
    { icon: 'person-outline' as const, label: 'Nome', value: user?.nome },
    { icon: 'mail-outline' as const, label: 'Email', value: user?.email },
    { icon: 'briefcase-outline' as const, label: 'Cargo', value: user?.cargo },
    { icon: 'at-outline' as const, label: 'Usuário', value: user?.username },
    { icon: 'shield-checkmark-outline' as const, label: 'Permissão', value: user?.role },
  ];

  return (
    <View style={styles.container}>
      <Ionicons name="person-circle-outline" size={80} color="#1c1c1c" style={{ marginBottom: 12 }} />
      <Text style={styles.name}>{user?.nome}</Text>
      <Text style={styles.cargo}>{user?.cargo}</Text>
      <View style={styles.card}>
        {items.map((item, i) => (
          <View key={i} style={styles.row}>
            <Ionicons name={item.icon} size={20} color="#666" />
            <View style={styles.content}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value || '-'}</Text>
            </View>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', paddingTop: 40 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  cargo: { fontSize: 15, color: '#666', marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, width: '90%', padding: 16, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  content: { marginLeft: 12, flex: 1 },
  label: { fontSize: 12, color: '#999' },
  value: { fontSize: 15, color: '#333', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', backgroundColor: '#d32f2f', width: '90%', padding: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 8 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
