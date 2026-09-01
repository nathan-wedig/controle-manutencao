import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Modal, FlatList, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { planosPreventivaApi } from '../../api/planosPreventiva';
import { maquinasApi } from '../../api/maquinas';
import { Maquina, PlanoPreventiva } from '../../types';

const UNIDADES = [
  { label: 'Dias', value: 'DIAS' },
  { label: 'Semanas', value: 'SEMANAS' },
  { label: 'Meses', value: 'MESES' },
];

type RouteParams = {
  PreventivaForm: { id?: string };
};

const PreventivaFormScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'PreventivaForm'>>();
  const navigation = useNavigation<any>();
  const editId = route.params?.id;
  const isEditing = !!editId;

  const [viewOnly, setViewOnly] = useState(isEditing);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const hoje = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };
  const toIso = (ddmm: string) => {
    const p = ddmm.split('/');
    if (p.length !== 3) return '';
    return `${p[2]}-${p[1]}-${p[0]}`;
  };
  const toDdMm = (iso: string) => {
    if (!iso) return '';
    const p = iso.split('-');
    if (p.length !== 3) return '';
    return `${p[2]}/${p[1]}/${p[0]}`;
  };

  const [ultimaExecucao, setUltimaExecucao] = useState(hoje);
  const [periodicidadeValor, setPeriodicidadeValor] = useState('');
  const [periodicidadeUnidade, setPeriodicidadeUnidade] = useState('DIAS');
  const [maquinaId, setMaquinaId] = useState('');
  const [maquinaNome, setMaquinaNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [maquinaModal, setMaquinaModal] = useState(false);
  const [maquinaSearch, setMaquinaSearch] = useState('');
  const onPeriodicidadeChange = useCallback((t: string) => setPeriodicidadeValor(t.replace(/[^0-9]/g, '')), []);

  const validateDate = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  useEffect(() => {
    maquinasApi.listar().then(data => setMaquinas(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => {
    if (!editId) return;
    setLoading(true);
    planosPreventivaApi.buscarPorId(editId)
      .then((d: any) => {
        setNome(d.nome || '');
        setDescricao(d.descricao || '');
        setUltimaExecucao(toDdMm(d.ultimaExecucao) || hoje);
        const mid = d.maquinaId || d.maquina?.id || '';
        const mNome = d.maquinaNome || (d.maquina ? `${d.maquina.codigoMaquina} - ${d.maquina.nome}` : '');
        setMaquinaId(mid);
        setMaquinaNome(mNome);
        if (d.periodicidadeDias) setPeriodicidadeValor(String(d.periodicidadeDias));
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar'))
      .finally(() => setLoading(false));
  }, [editId]));

  const handleSave = async () => {
    if (!nome.trim()) { Alert.alert('Campo obrigatório', 'Informe o tipo de ação preventiva'); return; }
    if (!maquinaId) { Alert.alert('Campo obrigatório', 'Selecione a máquina'); return; }
    if (!periodicidadeValor || parseInt(periodicidadeValor) < 1) { Alert.alert('Campo obrigatório', 'Informe a periodicidade'); return; }

    setSaving(true);
    try {
      const valor = parseInt(periodicidadeValor);
      const mult = periodicidadeUnidade === 'SEMANAS' ? 7 : periodicidadeUnidade === 'MESES' ? 30 : 1;
      const data: any = {
        nome: nome.trim(),
        descricao: descricao.trim(),
        maquinaId,
        periodicidadeDias: valor * mult,
        ultimaExecucao: toIso(ultimaExecucao) || null,
      };
      if (isEditing) {
        await planosPreventivaApi.atualizar(editId, data);
      } else {
        await planosPreventivaApi.criar(data);
      }
      navigation.goBack();
    } catch (error: any) {
      const status = error?.response?.status ? `HTTP ${error?.response?.status}` : '';
      const body = typeof error?.response?.data === 'object' ? JSON.stringify(error?.response?.data) : error?.response?.data;
      const msg = body || error?.message || 'Erro ao salvar';
      Alert.alert('Erro' + (status ? ` (${status})` : ''), msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#1c1c1c" /></View>;
  }

  const formContent = (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Tipo de Ação Preventiva *</Text>
      {viewOnly ? (
        <Text style={styles.viewField}>{nome || '—'}</Text>
      ) : (
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Troca de óleo, Limpeza..." placeholderTextColor="#999" />
      )}

      <Text style={styles.label}>Máquina *</Text>
      {viewOnly ? (
        <Text style={styles.viewField}>{maquinaNome || '—'}</Text>
      ) : (
        <TouchableOpacity style={styles.input} onPress={() => { setMaquinaSearch(''); setMaquinaModal(true); }}>
          <Text style={maquinaNome ? { color: '#333' } : { color: '#999' }}>{maquinaNome || 'Selecionar máquina'}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Data da Última Revisão</Text>
      {viewOnly ? (
        <Text style={styles.viewField}>{ultimaExecucao}</Text>
      ) : (
        <TextInput style={styles.input} value={ultimaExecucao} onChangeText={t => setUltimaExecucao(validateDate(t))} placeholder="dd/mm/aaaa" placeholderTextColor="#999" />
      )}

      <Text style={styles.label}>Repetir a cada *</Text>
      {viewOnly ? (
        <Text style={styles.viewField}>{periodicidadeValor ? `${periodicidadeValor} ${UNIDADES.find(u => u.value === periodicidadeUnidade)?.label.toLowerCase()}` : '—'}</Text>
      ) : (
        <View style={styles.row}>
          <TextInput style={[styles.input, styles.valorInput]} value={periodicidadeValor} onChangeText={onPeriodicidadeChange} keyboardType="numeric" placeholder="15" placeholderTextColor="#999" />
          <View style={styles.unidades}>
            {UNIDADES.map(u => (
              <TouchableOpacity key={u.value} style={[styles.unidadeBtn, periodicidadeUnidade === u.value && styles.unidadeBtnAtiva]} onPress={() => setPeriodicidadeUnidade(u.value)}>
                <Text style={[styles.unidadeText, periodicidadeUnidade === u.value && styles.unidadeTextAtiva]}>{u.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.label}>Observações</Text>
      {viewOnly ? (
        <Text style={styles.viewField}>{descricao || '—'}</Text>
      ) : (
        <TextInput style={[styles.input, styles.textArea]} value={descricao} onChangeText={setDescricao} multiline numberOfLines={4} placeholder="Observações..." placeholderTextColor="#999" />
      )}

      {viewOnly && isEditing && (
        <TouchableOpacity style={styles.abrirOSBtn} onPress={() => {
          navigation.navigate('OrdensTab', {
            screen: 'OSForm',
            params: {
              planoPreventivaId: editId,
              maquinaId: maquinaId,
              tipo: 'PREVENTIVA',
              preventivaObservacoes: descricao,
            },
          });
        }}>
          <Ionicons name="document-text-outline" size={18} color="#fff" />
          <Text style={styles.editBtnText}>Abrir OS</Text>
        </TouchableOpacity>
      )}
      {viewOnly ? (
        <TouchableOpacity style={styles.editBtn} onPress={() => setViewOnly(false)}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editBtnText}>Editar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
        </TouchableOpacity>
      )}
      {viewOnly && isEditing && (
        <TouchableOpacity style={styles.deleteBtn2} onPress={() => {
          Alert.alert('Excluir', `Excluir "${nome}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => planosPreventivaApi.deletar(editId).then(() => navigation.goBack()).catch(() => Alert.alert('Erro', 'Não foi possível excluir')) },
          ]);
        }}>
          <Ionicons name="trash-outline" size={18} color="#c0392b" />
          <Text style={styles.deleteBtnText}>Excluir</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {Platform.OS !== 'web' ? <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{formContent}</TouchableWithoutFeedback> : formContent}
    <Modal visible={maquinaModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecionar Máquina</Text>
          <TextInput style={styles.modalSearch} placeholder="Buscar máquina..." placeholderTextColor="#999" value={maquinaSearch} onChangeText={setMaquinaSearch} />
          <FlatList data={maquinas.filter(m => !maquinaSearch || m.nome.toLowerCase().includes(maquinaSearch.toLowerCase()) || m.codigoMaquina.toLowerCase().includes(maquinaSearch.toLowerCase()))} keyExtractor={(i: Maquina) => i.id} renderItem={({ item }: { item: Maquina }) => (
            <TouchableOpacity style={styles.modalItem} onPress={() => { setMaquinaId(item.id); setMaquinaNome(`${item.codigoMaquina} - ${item.nome}`); setMaquinaModal(false); }}>
              <Text style={styles.modalItemNome}>{item.codigoMaquina} - {item.nome}</Text>
              <Text style={styles.modalItemSetor}>{item.setor}</Text>
            </TouchableOpacity>
          )} {...({ ListEmptyComponent: <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>Nenhuma máquina encontrada</Text> } as any)} />
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setMaquinaModal(false)}>
            <Text style={styles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#ddd' },
  viewField: { backgroundColor: '#f9f9f9', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#555', borderWidth: 1, borderColor: '#e8e8e8' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  valorInput: { flex: 1 },
  unidades: { flexDirection: 'row', gap: 6 },
  unidadeBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  unidadeBtnAtiva: { backgroundColor: '#1c1c1c', borderColor: '#1c1c1c' },
  unidadeText: { fontSize: 13, color: '#666', fontWeight: '600' },
  unidadeTextAtiva: { color: '#fff' },
  abrirOSBtn: { backgroundColor: '#1565c0', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  saveBtn: { backgroundColor: '#1c1c1c', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  editBtn: { backgroundColor: '#1c1c1c', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  editBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  deleteBtn2: { paddingVertical: 14, alignItems: 'center', marginTop: 8, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  deleteBtnText: { color: '#c0392b', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12, textAlign: 'center' },
  modalSearch: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 8 },
  modalItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemNome: { fontSize: 15, fontWeight: '600', color: '#333' },
  modalItemSetor: { fontSize: 12, color: '#999', marginTop: 2 },
  modalCloseBtn: { padding: 14, alignItems: 'center', marginTop: 8 },
  modalCloseText: { color: '#1c1c1c', fontWeight: '600', fontSize: 15 },
});

export default PreventivaFormScreen;
