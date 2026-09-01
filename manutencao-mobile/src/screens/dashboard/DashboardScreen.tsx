import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import api from '../../api/client';
import { DashboardData } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const DashboardScreen: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const response = await api.get('/api/dashboard');
      setData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard', error);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (!data) {
    return <View style={styles.center}><Text style={styles.loadingText}>Carregando...</Text></View>;
  }

  const cards = [
    { label: 'Total Máquinas', value: data.totalMaquinas, color: '#333333', tab: 'MaquinasTab' as const },
    { label: 'Ativas', value: data.maquinasAtivas, color: '#2e7d32', tab: 'MaquinasTab' as const },
    { label: 'Em Manutenção', value: data.maquinasEmManutencao, color: '#ed6c02', tab: 'MaquinasTab' as const },
    { label: 'Paradas', value: data.maquinasParadas, color: '#d32f2f', tab: 'MaquinasTab' as const },
    { label: 'OS Abertas', value: data.ordensAbertas, color: '#f57c00', tab: 'OrdensTab' as const },
    { label: 'OS Concluídas', value: data.ordensConcluidas, color: '#2e7d32', tab: 'OrdensTab' as const },
    { label: 'Alertas', value: data.alertasAtivos, color: '#d32f2f', tab: 'MaquinasTab' as const },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.greeting}>Dashboard</Text>
      <Text style={styles.subtitle}>Indicadores do Sistema</Text>
      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity key={index} style={[styles.card, { borderLeftColor: card.color }]} onPress={() => navigation.navigate(card.tab)}>
            <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.totalCard} onPress={() => {
        if (user?.role !== 'USER') navigation.navigate('AdminTab', { screen: 'Relatorios' });
      }}>
        <Text style={styles.totalLabel}>Custo Total do Mês</Text>
        <Text style={styles.totalValue}>R$ {data.custoTotalMes?.toFixed(2) || '0,00'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#666', fontSize: 16 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flex: 1, minWidth: '45%', backgroundColor: '#fff', borderRadius: 12, padding: 16, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardValue: { fontSize: 28, fontWeight: 'bold' },
  cardLabel: { fontSize: 13, color: '#666', marginTop: 4 },
  totalCard: { backgroundColor: '#333333', borderRadius: 12, padding: 20, marginTop: 16, alignItems: 'center' },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  totalValue: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 4 },
});
