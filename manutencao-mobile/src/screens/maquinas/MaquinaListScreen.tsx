import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, TextInput, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { maquinasApi } from '../../api/maquinas';
import { Maquina } from '../../types';
import StatusBadge from '../../components/StatusBadge';
import { Ionicons } from '@expo/vector-icons';
import { FILES_BASE_URL } from '../../config';
import { MaquinasStackParamList } from '../../navigation/MainTabNavigator';

type Nav = NativeStackNavigationProp<MaquinasStackParamList, 'MaquinaList'>;

const MaquinaListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [filtered, setFiltered] = useState<Maquina[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);

  const naturalCompare = (a: string, b: string) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

  const sortByCode = (list: Maquina[], asc: boolean) =>
    [...list].sort((a, b) => {
      const cmp = naturalCompare(a.codigoMaquina || '', b.codigoMaquina || '');
      return asc ? cmp : -cmp;
    });

  const load = async () => {
    try {
      const data = await maquinasApi.listar();
      const sorted = sortByCode(data, sortAsc);
      setMaquinas(sorted);
      setFiltered(sorted);
    } catch (error) { console.error(error); }
  };

  useFocusEffect(useCallback(() => { load(); }, [sortAsc]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleSearch = (text: string) => {
    setSearch(text);
    if (!text.trim()) { setFiltered(maquinas); return; }
    const lower = text.toLowerCase();
    setFiltered(maquinas.filter(m =>
      m.nome?.toLowerCase().includes(lower) ||
      m.codigoMaquina?.toLowerCase().includes(lower) ||
      m.setor?.toLowerCase().includes(lower) ||
      m.numeroSerie?.toLowerCase().includes(lower) ||
      m.fabricante?.toLowerCase().includes(lower) ||
      m.modelo?.toLowerCase().includes(lower) ||
      m.nomeOperador?.toLowerCase().includes(lower) ||
      m.fonteEnergia?.toLowerCase().includes(lower)
    ));
  };

  const toggleSort = () => {
    const next = !sortAsc;
    setSortAsc(next);
    const sorted = sortByCode(filtered, next);
    setFiltered(sorted);
  };

  const renderItem = ({ item }: { item: Maquina }) => {
    const cover = item.anexos?.find(a => a.categoria === 'capa');
    return (
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MaquinaDetail', { id: item.id })}>
        {cover && <Image source={{ uri: FILES_BASE_URL + cover.url }} style={styles.coverThumb} />}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.codigo}>{item.codigoMaquina}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text style={styles.info}>Setor: {item.setor}</Text>
          {item.fabricante && <Text style={styles.info}>Fabricante: {item.fabricante}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput style={styles.search} placeholder="Buscar máquina..." placeholderTextColor="#999" value={search} onChangeText={handleSearch} />
        <TouchableOpacity style={styles.sortBtn} onPress={toggleSort}>
          <Ionicons name={sortAsc ? 'arrow-up' : 'arrow-down'} size={16} color="#333" />
          <Text style={styles.sortBtnText}>Código</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={filtered} keyExtractor={(item) => item.id} renderItem={renderItem}
        {...({ refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />, ListEmptyComponent: <Text style={{ color: '#999', fontSize: 15 }}>Nenhuma máquina encontrada</Text>, contentContainerStyle: filtered.length === 0 ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : undefined } as any)} />
      <TouchableOpacity style={styles.fabQr} onPress={() => navigation.navigate('QRCodeScanner')}>
        <Ionicons name="qr-code-outline" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('MaquinaForm', {})}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MaquinaListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchRow: { flexDirection: 'row', alignItems: 'center', margin: 16, marginBottom: 8, gap: 8 },
  search: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 15, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, flex: 1 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 8, gap: 4, elevation: 1, borderWidth: 1, borderColor: '#e0e0e0' },
  sortBtnText: { fontSize: 12, color: '#333', fontWeight: '600' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 5, padding: 12, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, flexDirection: 'row', alignItems: 'center' },
  coverThumb: { width: 60, height: 60, borderRadius: 8, marginRight: 12, backgroundColor: '#e0e0e0', resizeMode: 'cover' },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  codigo: { fontSize: 13, color: '#1c1c1c', fontWeight: '600' },
  nome: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  info: { fontSize: 13, color: '#666', marginTop: 2 },
  fabQr: { position: 'absolute', bottom: 20, left: 20, backgroundColor: '#1c1c1c', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#1c1c1c', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1c1c1c', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#1c1c1c', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  fabText: { fontSize: 28, color: '#fff', marginTop: -2 },
});
