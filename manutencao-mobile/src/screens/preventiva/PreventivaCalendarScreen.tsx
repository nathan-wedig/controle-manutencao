import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, RefreshControl, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { planosPreventivaApi } from '../../api/planosPreventiva';
import { PlanoPreventiva } from '../../types';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const PreventivaCalendarScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [planos, setPlanos] = useState<PlanoPreventiva[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [aba, setAba] = useState<'calendario' | 'lista'>('calendario');
  const [anoMes, setAnoMes] = useState(() => {
    const d = new Date();
    return { ano: d.getFullYear(), mes: d.getMonth() };
  });

  const load = async () => {
    try {
      const todos = await planosPreventivaApi.listar();
      setPlanos(Array.isArray(todos) ? todos : []);
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Erro ao carregar';
      if (typeof msg === 'string' && msg.length > 10) Alert.alert('Erro no servidor', msg);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const diasNoMes = (ano: number, mes: number) => new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = (ano: number, mes: number) => new Date(ano, mes, 1).getDay();

  const planosDoDia = (ano: number, mes: number, dia: number): PlanoPreventiva[] => {
    const yyyy = String(ano).padStart(4, '0');
    const mm = String(mes + 1).padStart(2, '0');
    const dd = String(dia).padStart(2, '0');
    return planos.filter(p => p.proximaExecucao && p.proximaExecucao.startsWith(`${yyyy}-${mm}-${dd}`));
  };

  const hojeStr = new Date().toISOString().slice(0, 10);
  const atrasados = planos.filter(p => p.proximaExecucao && p.proximaExecucao < hojeStr).sort((a, b) => a.proximaExecucao.localeCompare(b.proximaExecucao));
  const proximos = planos.filter(p => p.proximaExecucao && p.proximaExecucao >= hojeStr).sort((a, b) => a.proximaExecucao.localeCompare(b.proximaExecucao));
  const listaOrdenada = [...planos].filter(p => p.proximaExecucao).sort((a, b) => a.proximaExecucao.localeCompare(b.proximaExecucao));

  const diasAte = (data: string) => {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const alvo = new Date(data + 'T12:00:00');
    const diff = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
    if (diff < 0) return `Atrasado ${Math.abs(diff)} dia${Math.abs(diff) !== 1 ? 's' : ''}`;
    if (diff === 0) return 'Hoje';
    if (diff === 1) return 'Amanhã';
    return `Em ${diff} dias`;
  };

  const renderDias = () => {
    const { ano, mes } = anoMes;
    const totalDias = diasNoMes(ano, mes);
    const primeiroDia = primeiroDiaSemana(ano, mes);
    const dias: React.ReactNode[] = [];

    for (let i = 0; i < primeiroDia; i++) {
      dias.push(<View key={`empty-${i}`} style={styles.diaVazio} />);
    }

    for (let d = 1; d <= totalDias; d++) {
      const yyyy = String(ano).padStart(4, '0');
      const mm = String(mes + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dataStr = `${yyyy}-${mm}-${dd}`;
      const planosHoje = planosDoDia(ano, mes, d);
      const hoje = dataStr === hojeStr;

      dias.push(
        <TouchableOpacity key={d} style={[styles.dia, hoje && styles.diaHoje]} onPress={() => { if (planosHoje.length === 1) navigation.navigate('PreventivaForm', { id: planosHoje[0].id }); }} activeOpacity={0.7}>
          <Text style={[styles.diaTexto, hoje && styles.diaTextoHoje]}>{d}</Text>
          {planosHoje.map(p => (
            <TouchableOpacity key={p.id} style={styles.cardMini} onPress={() => navigation.navigate('PreventivaForm', { id: p.id })}>
              <Text style={styles.cardMiniNome} numberOfLines={1}>{p.nome}</Text>
              <Text style={styles.cardMiniMaq} numberOfLines={1}>{p.maquinaNome || p.maquina?.nome || ''}</Text>
            </TouchableOpacity>
          ))}
        </TouchableOpacity>
      );
    }

    return dias;
  };

  const handleDelete = (item: PlanoPreventiva) => {
    const confirm = (id: string) => planosPreventivaApi.deletar(id).then(load).catch(() => Alert.alert('Erro', 'Não foi possível excluir'));
    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir "${item.nome}"?`)) confirm(item.id);
    } else {
      Alert.alert('Excluir', `Excluir "${item.nome}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => confirm(item.id) },
      ]);
    }
  };

  const getBadgeStyle = (data: string) => {
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const alvo = new Date(data + 'T12:00:00');
    const diff = Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
    if (diff < 0) return styles.badgeAtrasado;
    if (diff <= 3) return styles.badgeProximo;
    return null;
  };

  const handleAbrirOS = (item: PlanoPreventiva) => {
    navigation.navigate('OrdensTab', {
      screen: 'OSForm',
      params: { planoPreventivaId: item.id, maquinaId: item.maquinaId, tipo: 'PREVENTIVA', preventivaNome: item.nome, preventivaObservacoes: item.descricao },
    });
  };

  const renderItem = ({ item }: { item: PlanoPreventiva }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PreventivaForm', { id: item.id })}>
      <View style={styles.cardContent}>
        <Text style={styles.cardNome}>{item.nome}</Text>
        <Text style={styles.cardMaquina}>{item.maquinaNome || item.maquina?.nome || '—'}</Text>
        <Text style={[styles.cardPrazo, getBadgeStyle(item.proximaExecucao)]}>{diasAte(item.proximaExecucao)}</Text>
        <TouchableOpacity style={styles.abrirOSBtn} onPress={() => handleAbrirOS(item)}>
          <Ionicons name="document-text-outline" size={14} color="#fff" />
          <Text style={styles.abrirOSText}>Abrir OS</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
        <Ionicons name="trash-outline" size={20} color="#c0392b" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {atrasados.length > 0 && (
        <View style={styles.atrasadoCard}>
          <View style={styles.alertaHeader}>
            <Ionicons name="alert-circle" size={22} color="#c0392b" />
            <Text style={[styles.alertaTitle, { color: '#c0392b' }]}>Ações Atrasadas</Text>
          </View>
          <Text style={[styles.alertaCount, { color: '#c0392b' }]}>{atrasados.length} ação(ões) atrasada(s)</Text>
          <View style={styles.alertaLista}>
            {atrasados.map(p => (
              <TouchableOpacity key={p.id} style={styles.atrasadoItem} onPress={() => navigation.navigate('PreventivaForm', { id: p.id })}>
                <Ionicons name="warning" size={14} color="#c0392b" />
                <Text style={styles.atrasadoItemText}>
                  {p.nome} — {p.maquinaNome || p.maquina?.nome || '—'} ({new Date(p.proximaExecucao + 'T12:00:00').toLocaleDateString('pt-BR')})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <View style={styles.alertaCard}>
        <View style={styles.alertaHeader}>
          <Ionicons name="alert-circle" size={22} color="#e67e22" />
          <Text style={styles.alertaTitle}>Ações nos próximos 30 dias</Text>
        </View>
        <Text style={styles.alertaCount}>{proximos.length} ação(ões) pendente(s)</Text>
        {proximos.length > 0 && (
          <View style={styles.alertaLista}>
            {proximos.slice(0, 3).map(p => (
              <Text key={p.id} style={styles.alertaItem}>• {p.nome} — {p.maquinaNome || p.maquina?.nome || '—'} ({new Date(p.proximaExecucao + 'T12:00:00').toLocaleDateString('pt-BR')})</Text>
            ))}
            {proximos.length > 3 && <Text style={styles.alertaMais}>e mais {proximos.length - 3}...</Text>}
          </View>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, aba === 'calendario' && styles.tabAtiva]} onPress={() => setAba('calendario')}>
          <Ionicons name="calendar-outline" size={18} color={aba === 'calendario' ? '#1c1c1c' : '#999'} />
          <Text style={[styles.tabText, aba === 'calendario' && styles.tabTextAtiva]}>Calendário</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, aba === 'lista' && styles.tabAtiva]} onPress={() => setAba('lista')}>
          <Ionicons name="list-outline" size={18} color={aba === 'lista' ? '#1c1c1c' : '#999'} />
          <Text style={[styles.tabText, aba === 'lista' && styles.tabTextAtiva]}>Lista</Text>
        </TouchableOpacity>
      </View>

      {aba === 'calendario' ? (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <View style={styles.calendario}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={() => setAnoMes(a => ({ ano: a.mes === 0 ? a.ano - 1 : a.ano, mes: a.mes === 0 ? 11 : a.mes - 1 }))}>
                <Ionicons name="chevron-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.calTitle}>{MESES[anoMes.mes]} {anoMes.ano}</Text>
              <TouchableOpacity onPress={() => setAnoMes(a => ({ ano: a.mes === 11 ? a.ano + 1 : a.ano, mes: a.mes === 11 ? 0 : a.mes + 1 }))}>
                <Ionicons name="chevron-forward" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.diasSemana}>
              {DIAS_SEMANA.map(d => <Text key={d} style={styles.diaSemanaTexto}>{d}</Text>)}
            </View>
            <View style={styles.diasGrid}>{renderDias()}</View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={listaOrdenada}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          {...({ ListEmptyComponent: <Text style={{ color: '#999', fontSize: 15, textAlign: 'center', marginTop: 40 }}>Nenhuma preventiva cadastrada</Text> } as any)}
          contentContainerStyle={planos.length === 0 ? { flex: 1, justifyContent: 'center' } : undefined}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PreventivaForm', {})}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  atrasadoCard: { backgroundColor: '#fdecea', margin: 12, marginBottom: 0, padding: 14, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#c0392b' },
  atrasadoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  atrasadoItemText: { fontSize: 13, color: '#c0392b', flex: 1 },
  alertaCard: { backgroundColor: '#fff8e1', margin: 12, padding: 14, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#e67e22' },
  alertaHeader: { flexDirection: 'row', alignItems: 'center' },
  alertaTitle: { fontSize: 15, fontWeight: '600', color: '#333', marginLeft: 8 },
  alertaCount: { fontSize: 13, color: '#666', marginTop: 4 },
  alertaLista: { marginTop: 8 },
  alertaItem: { fontSize: 12, color: '#555', marginTop: 2 },
  alertaMais: { fontSize: 12, color: '#999', marginTop: 2, fontStyle: 'italic' },
  tabs: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 8, backgroundColor: '#e0e0e0', borderRadius: 8, overflow: 'hidden' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 6 },
  tabAtiva: { backgroundColor: '#fff' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#999' },
  tabTextAtiva: { color: '#1c1c1c' },
  calendario: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 12, elevation: 2 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  diasSemana: { flexDirection: 'row', marginBottom: 8 },
  diaSemanaTexto: { flex: 1, textAlign: 'center', fontSize: 11, color: '#999', fontWeight: '600' },
  diasGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dia: { width: '14.28%', minHeight: 80, paddingTop: 4, alignItems: 'center', borderRadius: 8, borderWidth: 0.5, borderColor: '#eee', overflow: 'hidden' },
  diaHoje: { backgroundColor: '#1c1c1c' },
  diaVazio: { width: '14.28%', minHeight: 80 },
  diaTexto: { fontSize: 12, color: '#333', fontWeight: '600', marginBottom: 2 },
  diaTextoHoje: { color: '#fff', fontWeight: '700' },
  cardMini: { backgroundColor: '#e8f0fe', borderRadius: 4, paddingHorizontal: 3, paddingVertical: 2, marginBottom: 2, width: '96%', alignSelf: 'center' },
  cardMiniNome: { fontSize: 9, color: '#1c1c1c', fontWeight: '600' },
  cardMiniMaq: { fontSize: 8, color: '#666' },
  card: { backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardContent: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '600', color: '#1c1c1c' },
  cardMaquina: { fontSize: 13, color: '#666', marginTop: 2 },
  cardPrazo: { fontSize: 12, color: '#999', marginTop: 4, fontWeight: '600' },
  badgeAtrasado: { color: '#c0392b' },
  badgeProximo: { color: '#e67e22' },
  abrirOSBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6, alignSelf: 'flex-start', gap: 4 },
  abrirOSText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  deleteBtn: { padding: 8 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#1c1c1c', justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
});

export default PreventivaCalendarScreen;
