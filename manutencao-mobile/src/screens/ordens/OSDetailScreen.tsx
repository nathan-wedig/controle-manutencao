import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, TextInput, Modal, Image, Linking, Platform } from 'react-native';
import { useFocusEffect, useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ordensApi } from '../../api/ordensServico';
import { OrdemServico } from '../../types';
import { OrdensStackParamList } from '../../navigation/MainTabNavigator';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { FILES_BASE_URL } from '../../config';

type DetailRoute = RouteProp<OrdensStackParamList, 'OSDetail'>;

const OSDetailScreen: React.FC = () => {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [os, setOs] = useState<OrdemServico | null>(null);
  const [loading, setLoading] = useState(true);
  const [concludeModal, setConcludeModal] = useState(false);
  const [acaoFeita, setAcaoFeita] = useState('');
  const [dataConclusaoDate, setDataConclusaoDate] = useState('');
  const [dataConclusaoTime, setDataConclusaoTime] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ordensApi.buscarPorId(route.params.id);
      setOs(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false) }
  }, [route.params.id]);

  useFocusEffect(useCallback(() => { load() }, [load]));

  const action = async (fn: () => Promise<void>, errorMsg: string) => {
    try { await fn(); load(); } catch (e: any) { Alert.alert('Erro', errorMsg || e.message); }
  };

  const handleDelete = () => {
    if (!os) return;
    const confirmar = () => {
      (async () => {
        try {
          await ordensApi.deletar(os.id);
          navigation.goBack();
        } catch (e: any) {
          console.error('Erro ao excluir OS:', e);
          Alert.alert('Erro', e?.response?.data?.erro || e.message || 'Erro ao excluir');
        }
      })();
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Tem certeza que deseja excluir a OS ${os.numeroOS}?`)) confirmar();
    } else {
      Alert.alert('Excluir OS', `Tem certeza que deseja excluir a OS ${os.numeroOS}?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmar },
      ]);
    }
  };

  const maskDate = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 4) formatted += '/';
      formatted += digits[i];
    }
    return formatted;
  };

  const maskTime = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i === 2) formatted += ':';
      formatted += digits[i];
    }
    return formatted;
  };

  const handleConclude = async () => {
    if (!os || !acaoFeita.trim()) { Alert.alert('Erro', 'Informe a ação realizada'); return; }
    const payload: any = { acaoFeita };
    const dateParts = dataConclusaoDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const timeParts = dataConclusaoTime.match(/^(\d{2}):(\d{2})$/);
    if (dateParts && timeParts) {
      payload.dataConclusao = `${dateParts[3]}-${dateParts[2]}-${dateParts[1]}T${timeParts[1]}:${timeParts[2]}:00`;
    }
    await action(() => ordensApi.concluir(os.id, payload), 'Erro ao concluir');
    setConcludeModal(false);
    setAcaoFeita('');
    setDataConclusaoDate('');
  };

  const openConcludeModal = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    setDataConclusaoDate(`${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`);
    setDataConclusaoTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
    setConcludeModal(true);
  };

  const isAdmin = user?.role === 'ADMIN';

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#1c1c1c" />;
  if (!os) return <Text style={{ textAlign: 'center', marginTop: 60 }}>OS não encontrada</Text>;

  const formatDt = (d: string) => d ? new Date(d).toLocaleString() : '';
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.numero}>{os.numeroOS}</Text>
          <StatusBadge status={os.status} />
        </View>
        <Text style={styles.field}>Tipo: {os.tipo}</Text>
        <Text style={styles.field}>Prioridade: {os.prioridade}</Text>
        {os.maquinaNome ? <Text style={styles.field}>Máquina: {os.maquinaCodigo ? `${os.maquinaCodigo} - ${os.maquinaNome}` : os.maquinaNome}</Text> : null}
      </View>

      {os.problemaRelatado ? (
        <View style={styles.section}>
          <Text style={styles.label}>Problema Relatado</Text>
          <Text style={styles.value}>{os.problemaRelatado}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        {os.dataAbertura ? <Text style={styles.field}>Data Abertura: {formatDt(os.dataAbertura)}</Text> : null}
        {os.dataMaxima ? <Text style={styles.field}>Data Máxima: {formatDate(os.dataMaxima)}</Text> : null}
        {os.dataConclusao ? <Text style={styles.field}>Data Conclusão: {formatDt(os.dataConclusao)}</Text> : null}
      </View>

      {os.fornecedorNome ? (
        <View style={styles.section}>
          <Text style={styles.label}>Fornecedor / Terceiro</Text>
          <Text style={styles.value}>{os.fornecedorNome}</Text>
          {os.observacoesTerceiro ? <Text style={styles.field}>{os.observacoesTerceiro}</Text> : null}
        </View>
      ) : null}

      {os.observacoes ? (
        <View style={styles.section}>
          <Text style={styles.label}>Observações</Text>
          <Text style={styles.value}>{os.observacoes}</Text>
        </View>
      ) : null}

      {os.acaoFeita ? (
        <View style={styles.section}>
          <Text style={styles.label}>Ação Realizada</Text>
          <Text style={styles.value}>{os.acaoFeita}</Text>
        </View>
      ) : null}

      {os.itensCusto && os.itensCusto.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.label}>Custos</Text>
          {os.itensCusto.map((item, idx) => (
            <Text key={idx} style={styles.field}>{item.descricao} - {item.unidade}x R$ {Number(item.valorUnitario).toFixed(2)}</Text>
          ))}
          {os.custoTotal ? <Text style={[styles.field, { fontWeight: 'bold', marginTop: 4 }]}>Total: R$ {Number(os.custoTotal).toFixed(2)}</Text> : null}
        </View>
      ) : null}

      {os.anexos && os.anexos.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.label}>Anexos ({os.anexos.length})</Text>
          <View style={styles.anexosGrid}>
            {os.anexos.map(a => {
              const isImage = a.tipo?.startsWith('image/');
              const fullUrl = FILES_BASE_URL + a.url;
              return (
                <TouchableOpacity key={a.id} style={styles.anexoCard} onPress={() => Linking.openURL(fullUrl)}>
                  {isImage ? (
                    <Image source={{ uri: fullUrl }} style={styles.anexoThumb} />
                  ) : (
                    <View style={styles.anexoFileIcon}>
                      <Ionicons name="document-outline" size={28} color="#999" />
                    </View>
                  )}
                  <Text style={styles.anexoName} numberOfLines={2}>{a.nomeOriginal}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.actions}>
        {os.status === 'ABERTA' && (
          <TouchableOpacity style={styles.startBtn} onPress={() => action(() => ordensApi.iniciar(os.id), 'Erro ao iniciar')}>
            <Text style={styles.btnTextAction}>Iniciar</Text>
          </TouchableOpacity>
        )}
        {os.status === 'EM_ANDAMENTO' && (
          <TouchableOpacity style={styles.completeBtn} onPress={openConcludeModal}>
            <Text style={styles.btnTextAction}>Concluir</Text>
          </TouchableOpacity>
        )}
        {(os.status === 'ABERTA' || os.status === 'EM_ANDAMENTO') && (
          <>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('OSForm', { id: os.id })}>
              <Text style={styles.btnTextAction}>Editar OS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelStatusBtn} onPress={() => {
              const confirmar = () => action(() => ordensApi.cancelar(os.id), 'Erro ao cancelar');
              if (Platform.OS === 'web') {
                if (window.confirm('Deseja cancelar esta OS?')) confirmar();
              } else {
                Alert.alert('Cancelar OS', 'Deseja cancelar esta OS?', [
                  { text: 'Não', style: 'cancel' },
                  { text: 'Sim', onPress: confirmar },
                ]);
              }
            }}>
              <Text style={styles.btnTextAction}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.btnTextAction}>Excluir OS</Text>
            </TouchableOpacity>
          </>
        )}
        {(isAdmin && (os.status === 'CONCLUIDA' || os.status === 'CANCELADA')) && (
          <>
            <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('OSForm', { id: os.id })}>
              <Text style={styles.btnTextAction}>Editar OS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.btnTextAction}>Excluir OS</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Modal visible={concludeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Concluir OS</Text>
            <Text style={styles.modalLabel}>Data / Hora Conclusão</Text>
            <View style={styles.modalRow}>
              <TextInput style={[styles.modalInputSmall, styles.modalInputHalf]} value={dataConclusaoDate} onChangeText={t => setDataConclusaoDate(maskDate(t))} placeholder="dd/mm/aaaa" placeholderTextColor="#999" keyboardType="numeric" maxLength={10} />
              <TextInput style={[styles.modalInputSmall, styles.modalInputHalf]} value={dataConclusaoTime} onChangeText={t => setDataConclusaoTime(maskTime(t))} placeholder="hh:mm" placeholderTextColor="#999" keyboardType="numeric" maxLength={5} />
            </View>
            <Text style={styles.modalLabel}>Ação Realizada *</Text>
            <TextInput style={styles.modalInput} value={acaoFeita} onChangeText={setAcaoFeita} multiline numberOfLines={4} placeholder="Descreva a ação realizada..." placeholderTextColor="#999" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setConcludeModal(false); setAcaoFeita(''); setDataConclusaoDate(''); setDataConclusaoTime(''); }}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleConclude}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default OSDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: { backgroundColor: '#fff', margin: 16, marginBottom: 0, padding: 14, borderRadius: 10, elevation: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { fontSize: 18, fontWeight: 'bold', color: '#1c1c1c', marginBottom: 6 },
  field: { fontSize: 14, color: '#555', marginBottom: 2, lineHeight: 20 },
  label: { fontSize: 15, fontWeight: 'bold', color: '#1c1c1c', marginBottom: 6 },
  value: { fontSize: 14, color: '#444', marginBottom: 4 },
  anexosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  anexoCard: { width: 100, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  anexoThumb: { width: 100, height: 80, resizeMode: 'cover' },
  anexoFileIcon: { width: 100, height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  anexoName: { fontSize: 10, color: '#555', textAlign: 'center', paddingHorizontal: 4, paddingTop: 2 },
  actions: { paddingHorizontal: 16, paddingBottom: 40, gap: 10, marginTop: 20 },
  startBtn: { backgroundColor: '#2980b9', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  completeBtn: { backgroundColor: '#27ae60', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  cancelStatusBtn: { backgroundColor: '#e67e22', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  editBtn: { backgroundColor: '#1c1c1c', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  deleteBtn: { backgroundColor: '#c0392b', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  btnTextAction: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1c1c1c', marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6 },
  modalInput: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 15, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd' },
  modalInputSmall: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 15, borderWidth: 1, borderColor: '#ddd', marginBottom: 12 },
  modalRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  modalInputHalf: { flex: 1, marginBottom: 0 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalCancelText: { fontSize: 15, color: '#666', fontWeight: '500' },
  modalConfirm: { backgroundColor: '#27ae60', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalConfirmText: { fontSize: 15, color: '#fff', fontWeight: 'bold' },
});