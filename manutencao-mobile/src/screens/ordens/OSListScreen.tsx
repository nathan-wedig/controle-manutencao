import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, TextInput, Modal } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ordensApi } from '../../api/ordensServico';
import { maquinasApi } from '../../api/maquinas';
import { OrdemServico, Maquina } from '../../types';
import { OrdensStackParamList } from '../../navigation/MainTabNavigator';
import StatusBadge from '../../components/StatusBadge';

type Nav = NativeStackNavigationProp<OrdensStackParamList, 'OSList'>;

const statusFilters = ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA'];
type SortOrder = 'desc' | 'asc';

const OSListScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [filtered, setFiltered] = useState<OrdemServico[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [selectedMaquinas, setSelectedMaquinas] = useState<string[]>([]);
  const [maquinaModalOpen, setMaquinaModalOpen] = useState(false);
  const [machineSearch, setMachineSearch] = useState('');

  const searchRef = useRef(search);
  const filterStatusRef = useRef(filterStatus);
  const selectedMaquinasRef = useRef(selectedMaquinas);
  const sortOrderRef = useRef(sortOrder);
  searchRef.current = search;
  filterStatusRef.current = filterStatus;
  selectedMaquinasRef.current = selectedMaquinas;
  sortOrderRef.current = sortOrder;

  const sortByDate = (list: OrdemServico[], order: SortOrder) => {
    return [...list].sort((a, b) => {
      const cmp = a.dataAbertura.localeCompare(b.dataAbertura);
      return order === 'desc' ? -cmp : cmp;
    });
  };

  const applyFilters = (base: OrdemServico[], text: string, status: string, maquinasSel: string[]) => {
    let list = base;
    if (maquinasSel.length > 0) list = list.filter(o => maquinasSel.includes(o.maquinaId));
    if (text.trim()) {
      const lower = text.toLowerCase();
      list = list.filter(o =>
        o.numeroOS.toLowerCase().includes(lower) ||
        o.maquinaNome?.toLowerCase().includes(lower) ||
        o.maquinaCodigo?.toLowerCase().includes(lower) ||
        o.problemaRelatado?.toLowerCase().includes(lower) ||
        o.observacoes?.toLowerCase().includes(lower) ||
        o.observacoesTerceiro?.toLowerCase().includes(lower) ||
        o.tipo?.toLowerCase().includes(lower) ||
        o.prioridade?.toLowerCase().includes(lower) ||
        (o.dataAbertura ? new Date(o.dataAbertura).toLocaleDateString().includes(lower) : false)
      );
    }
    if (status) list = list.filter(o => o.status === status);
    setFiltered(sortByDate(list, sortOrderRef.current));
  };

  const load = async () => {
    try {
      const data = await ordensApi.listar();
      setOrdens(data);
      applyFilters(data, searchRef.current, filterStatusRef.current, selectedMaquinasRef.current);
    } catch (error) { console.error(error); }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  useEffect(() => {
    maquinasApi.listar().then(ms => {
      const sorted = [...ms].sort((a, b) => a.nome?.localeCompare(b.nome || '') || 0);
      setMaquinas(sorted);
    }).catch(() => {});
  }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const handleToggleMaquina = (maquinaId: string) => {
    setSelectedMaquinas(prev => {
      const next = prev.includes(maquinaId) ? prev.filter(id => id !== maquinaId) : [...prev, maquinaId];
      applyFilters(ordens, search, filterStatus, next);
      return next;
    });
  };

  const handleClearMaquinas = () => {
    setSelectedMaquinas([]);
    setMachineSearch('');
    applyFilters(ordens, search, filterStatus, []);
  };

  const filteredMaquinas = machineSearch.trim()
    ? maquinas.filter(m =>
        m.nome?.toLowerCase().includes(machineSearch.toLowerCase()) ||
        m.codigoMaquina?.toLowerCase().includes(machineSearch.toLowerCase()))
    : maquinas;

  const toggleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    setFiltered(sortByDate(filtered, newOrder));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TextInput style={styles.search} placeholder="Buscar OS..." placeholderTextColor="#999" value={search}
          onChangeText={(t) => { setSearch(t); applyFilters(ordens, t, filterStatus, selectedMaquinas); }} />
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('OSForm', {})}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Nova</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.maquinaFilterBtn, selectedMaquinas.length > 0 && styles.maquinaFilterBtnActive]} onPress={() => setMaquinaModalOpen(true)}>
        <Ionicons name="hardware-chip-outline" size={16} color={selectedMaquinas.length > 0 ? '#fff' : '#333'} />
        <Text style={[styles.maquinaFilterText, selectedMaquinas.length > 0 && { color: '#fff' }]} numberOfLines={1}>
          {selectedMaquinas.length > 0 ? `${selectedMaquinas.length} máquina(s) selecionada(s)` : 'Todas as máquinas'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={selectedMaquinas.length > 0 ? '#fff' : '#999'} />
      </TouchableOpacity>
      <View style={styles.filterRow}>
        {statusFilters.map(s => (
          <TouchableOpacity key={s} style={[styles.filterBtn, filterStatus === s && styles.filterBtnActive]}
            onPress={() => { const ns = filterStatus === s ? '' : s; setFilterStatus(ns); applyFilters(ordens, search, ns, selectedMaquinas); }}>
            <Text style={[styles.filterText, filterStatus === s && styles.filterTextActive]}>{s.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.sortBtn, { marginLeft: 'auto' }]} onPress={toggleSort}>
          <Ionicons name={sortOrder === 'desc' ? 'arrow-down' : 'arrow-up'} size={14} color="#333" />
          <Text style={styles.sortBtnText}>{sortOrder === 'desc' ? 'Recente' : 'Antiga'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={filtered} keyExtractor={i => i.id} renderItem={({ item }: { item: OrdemServico }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OSDetail', { id: item.id })}>
          <View style={styles.cardHeader}>
            <Text style={styles.numero}>{item.numeroOS}</Text>
            <StatusBadge status={item.status} />
          </View>
          <Text style={styles.tipo}>{item.tipo}</Text>
          {item.maquinaNome && <Text style={styles.info}>Máquina: {item.maquinaCodigo ? `${item.maquinaCodigo} - ${item.maquinaNome}` : item.maquinaNome}</Text>}
          <View style={styles.cardFooter}>
            <StatusBadge status={item.prioridade} />
            <Text style={styles.date}>{new Date(item.dataAbertura).toLocaleDateString()}</Text>
          </View>
        </TouchableOpacity>
      )} {...({ refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />, ListEmptyComponent: <Text style={{ color: '#999', fontSize: 15, textAlign: 'center', marginTop: 40 }}>Nenhuma OS encontrada</Text> } as any)} />

      <Modal visible={maquinaModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar por Máquina</Text>
              <TouchableOpacity onPress={() => setMaquinaModalOpen(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.modalSearch} placeholder="Buscar máquina..." placeholderTextColor="#999"
              value={machineSearch} onChangeText={setMachineSearch} autoCapitalize="none" autoCorrect={false} />
            <FlatList data={filteredMaquinas} keyExtractor={(m: Maquina) => m.id}
              renderItem={({ item }: { item: Maquina }) => (
                <TouchableOpacity style={[styles.machineItem, selectedMaquinas.includes(item.id) && styles.machineItemActive]}
                  onPress={() => handleToggleMaquina(item.id)}>
                  <Text style={[styles.machineItemText, selectedMaquinas.includes(item.id) && styles.machineItemTextActive]}>{item.codigoMaquina} - {item.nome}</Text>
                  {selectedMaquinas.includes(item.id) && <Ionicons name="checkmark" size={20} color="#fff" />}
                </TouchableOpacity>
              )}
              {...({ ListEmptyComponent: <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>Nenhuma máquina encontrada</Text> } as any)}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalClearBtn} onPress={handleClearMaquinas}>
                <Text style={styles.modalClearText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDoneBtn} onPress={() => setMaquinaModalOpen(false)}>
                <Text style={styles.modalDoneText}>Aplicar ({selectedMaquinas.length})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OSListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 8 },
  search: { backgroundColor: '#fff', margin: 16, marginBottom: 4, padding: 12, borderRadius: 8, fontSize: 15, elevation: 1, flex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8, gap: 4, marginTop: 8 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  maquinaFilterBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 4, marginBottom: 8, padding: 12, borderRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#e0e0e0' },
  maquinaFilterBtnActive: { backgroundColor: '#1c1c1c', borderColor: '#1c1c1c' },
  maquinaFilterText: { fontSize: 14, color: '#333', flex: 1, fontWeight: '500' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8, alignItems: 'center' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  filterBtnActive: { backgroundColor: '#1c1c1c', borderColor: '#1c1c1c' },
  filterText: { fontSize: 12, color: '#666' },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', gap: 4 },
  sortBtnText: { fontSize: 12, color: '#333', fontWeight: '500' },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, padding: 14, borderRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  numero: { fontSize: 15, fontWeight: 'bold', color: '#1c1c1c' },
  tipo: { fontSize: 14, color: '#333', fontWeight: '500' },
  info: { fontSize: 13, color: '#666', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  date: { fontSize: 12, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalSearch: { backgroundColor: '#f5f5f5', margin: 12, padding: 12, borderRadius: 8, fontSize: 15 },
  machineItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, marginHorizontal: 12, marginVertical: 3, borderRadius: 8, backgroundColor: '#f9f9f9' },
  machineItemActive: { backgroundColor: '#1c1c1c' },
  machineItemText: { fontSize: 14, color: '#333' },
  machineItemTextActive: { color: '#fff', fontWeight: '600' },
  modalFooter: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  modalClearBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  modalClearText: { fontSize: 14, color: '#666', fontWeight: '600' },
  modalDoneBtn: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#1c1c1c', alignItems: 'center' },
  modalDoneText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});