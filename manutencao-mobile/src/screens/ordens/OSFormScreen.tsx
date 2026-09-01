import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Modal, FlatList, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Image, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ordensApi } from '../../api/ordensServico';
import { maquinasApi } from '../../api/maquinas';
import { fornecedoresApi } from '../../api/fornecedores';
import { uploadApi, UploadResult } from '../../api/upload';
import { Fornecedor, Maquina } from '../../types';

interface CustoItem { descricao: string; unidade: string; valorUnitario: string; }
import { OrdensStackParamList } from '../../navigation/MainTabNavigator';
import { FILES_BASE_URL } from '../../config';

type Nav = NativeStackNavigationProp<OrdensStackParamList, 'OSForm'>;
type Route = RouteProp<OrdensStackParamList, 'OSForm'>;

const tipos = ['PREVENTIVA', 'CORRETIVA', 'EMERGENCIAL', 'INSTALACAO'];
const prioridades = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'];

const OSFormScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const params = route.params || {};
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [saving, setSaving] = useState(false);
  const [tipo, setTipo] = useState((params as any).tipo || 'CORRETIVA');
  const [prioridade, setPrioridade] = useState('MEDIA');
  const [maquinaId, setMaquinaId] = useState((params as any).maquinaId || '');
  const [maquinaNome, setMaquinaNome] = useState('');
  const [problemaRelatado, setProblemaRelatado] = useState('');
  const [observacoes, setObservacoes] = useState((params as any).preventivaObservacoes || '');
  const [dataMaxima, setDataMaxima] = useState('');
  const [dataMaximaInfinita, setDataMaximaInfinita] = useState(false);
  const [itensCusto, setItensCusto] = useState<CustoItem[]>([]);
  const [showMachineModal, setShowMachineModal] = useState(false);
  const [machineSearch, setMachineSearch] = useState('');
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorId, setFornecedorId] = useState('');
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [observacoesTerceiro, setObservacoesTerceiro] = useState('');
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [fornecedorSearch, setFornecedorSearch] = useState('');
  const [dataAbertura, setDataAbertura] = useState(new Date().toLocaleDateString('pt-BR'));
  const [anexos, setAnexos] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const existingAnexoIds = useRef<Set<string>>(new Set());

  useFocusEffect(useCallback(() => {
    const id = (params as any).id;
    if (id) {
      ordensApi.buscarPorId(id).then(os => {
        setTipo(os.tipo);
        setPrioridade(os.prioridade);
        setMaquinaId(os.maquinaId || '');
        setMaquinaNome(os.maquinaNome ? `${os.maquinaCodigo} - ${os.maquinaNome}` : '');
        setProblemaRelatado(os.problemaRelatado || '');
        setObservacoes(os.observacoes || '');
        setObservacoesTerceiro(os.observacoesTerceiro || '');
        if (os.dataMaxima) {
          const d = new Date(os.dataMaxima);
          setDataMaxima(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
        }
        if (os.dataAbertura) {
          const d = new Date(os.dataAbertura);
          setDataAbertura(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`);
        }
        setFornecedorId(os.fornecedorId || '');
        setFornecedorNome(os.fornecedorNome || '');
        if (os.itensCusto?.length) setItensCusto(os.itensCusto.map(i => ({ descricao: i.descricao, unidade: String(i.unidade), valorUnitario: String(i.valorUnitario) })));
        if (os.anexos?.length) {
          setAnexos(os.anexos.map(a => ({ id: a.id, url: a.url, nomeOriginal: a.nomeOriginal, tipo: a.tipo } as any)));
          existingAnexoIds.current = new Set(os.anexos.map(a => a.id));
        }
      }).catch(() => {});
    }
    maquinasApi.listar().then(ms => {
      setMaquinas(ms);
      const mId = (params as any).maquinaId || (params as any).id;
      if (mId && !(params as any).id) {
        const m = ms.find((x: Maquina) => x.id === mId);
        if (m) setMaquinaNome(`${m.codigoMaquina} - ${m.nome}`);
      }
    }).catch(() => {});
    fornecedoresApi.listar().then(setFornecedores).catch(() => {});
  }, []));

  const planoPreventivaId = (params as any).planoPreventivaId;

  const filteredMaquinas = machineSearch.trim()
    ? maquinas.filter(m => m.nome.toLowerCase().includes(machineSearch.toLowerCase()) || m.codigoMaquina?.toLowerCase().includes(machineSearch.toLowerCase()))
    : maquinas;

  const addCustoItem = () => {
    setItensCusto(prev => [...prev, { descricao: '', unidade: '1', valorUnitario: '' }]);
  };

  const updateCustoItem = (index: number, field: 'descricao' | 'unidade' | 'valorUnitario', value: string) => {
    setItensCusto(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeCustoItem = (index: number) => {
    setItensCusto(prev => prev.filter((_, i) => i !== index));
  };

  const parseBr = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;

  const totalCustos = itensCusto.reduce((sum, item) => sum + (parseBr(item.unidade) * parseBr(item.valorUnitario)), 0);

  const validateDate = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const sanitizeFileName = (fileName: string): string => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  };

  const doUpload = async (uri: string, name: string, mimeType: string, categoria: string) => {
    setUploading(true);
    try {
      const sanitizedName = sanitizeFileName(name);
      const uploaded = await uploadApi.upload(uri, sanitizedName, mimeType, categoria);
      setAnexos(prev => [...prev, { ...uploaded, url: FILES_BASE_URL + uploaded.url }]);
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão necessária', 'Permita o acesso à galeria'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      doUpload(a.uri, a.fileName || `foto_${Date.now()}.jpg`, a.mimeType || 'image/jpeg', 'imagem');
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permissão necessária', 'Permita o acesso à câmera'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      doUpload(a.uri, a.fileName || `foto_${Date.now()}.jpg`, a.mimeType || 'image/jpeg', 'imagem');
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      doUpload(a.uri, a.name, a.mimeType || 'application/octet-stream', 'documento');
    }
  };

  const handleSave = async () => {
    if (!problemaRelatado) { Alert.alert('Erro', 'Informe o problema relatado'); return; }
    setSaving(true);
    const editingId = (params as any).id;
    try {
      const payload: any = { tipo, prioridade, problemaRelatado, observacoes, observacoesTerceiro };
      if (maquinaId) payload.maquinaId = maquinaId;
      if (fornecedorId) payload.fornecedorId = fornecedorId;
      if (planoPreventivaId) payload.planoPreventivaId = planoPreventivaId;
      if (dataAbertura.length === 10) {
        const [d, m, a] = dataAbertura.split('/');
        payload.dataAbertura = `${a}-${m}-${d}T00:00:00`;
      }
      if (!dataMaximaInfinita && dataMaxima.length === 10) {
        const [d, m, a] = dataMaxima.split('/');
        payload.dataMaxima = `${a}-${m}-${d}`;
      }
      if (itensCusto.length > 0) {
        payload.itensCusto = itensCusto.filter(i => i.descricao.trim()).map(i => ({
          descricao: i.descricao,
          unidade: parseBr(i.unidade),
          valorUnitario: parseBr(i.valorUnitario),
        }));
      }
      if (editingId) {
        await ordensApi.atualizar(editingId, payload as any);
        const currentIds = new Set(anexos.map(a => a.id));
        for (const anexo of anexos) {
          if (!existingAnexoIds.current.has(anexo.id)) {
            try { await ordensApi.associarAnexo(editingId, anexo.id); } catch (_) {}
          }
        }
        for (const oldId of existingAnexoIds.current) {
          if (!currentIds.has(oldId)) {
            try { await ordensApi.removerAnexo(editingId, oldId); } catch (_) {}
          }
        }
        navigation.replace('OSDetail', { id: editingId, fromMaquinaId: (params as any).fromMaquinaId });
      } else {
        const created = await ordensApi.criar(payload as any);
        for (const anexo of anexos) {
          await ordensApi.associarAnexo(created.id, anexo.id);
        }
        navigation.replace('OSDetail', { id: created.id, fromMaquinaId: (params as any).fromMaquinaId });
      }
    } catch (error: any) { Alert.alert('Erro', error.response?.data?.error || 'Erro ao salvar OS'); }
    finally { setSaving(false); }
  };

  const renderMachineModal = () => (
    <Modal visible={showMachineModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Máquina</Text>
            <TouchableOpacity onPress={() => setShowMachineModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput style={styles.modalSearch} placeholder="Buscar máquina..." placeholderTextColor="#999"
            value={machineSearch} onChangeText={setMachineSearch} />
          <FlatList data={filteredMaquinas} keyExtractor={(i: Maquina) => i.id}
            renderItem={({ item }: { item: Maquina }) => (
              <TouchableOpacity style={[styles.machineItem, maquinaId === item.id && styles.machineItemActive]}
                onPress={() => { setMaquinaId(item.id); setMaquinaNome(`${item.codigoMaquina} - ${item.nome}`); setShowMachineModal(false); setMachineSearch(''); }}>
                <Text style={[styles.machineItemText, maquinaId === item.id && styles.machineItemTextActive]}>{item.codigoMaquina} - {item.nome}</Text>
                {maquinaId === item.id && <Ionicons name="checkmark" size={20} color="#fff" />}
              </TouchableOpacity>
            )}
            {...({ ListEmptyComponent: <Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>Nenhuma máquina encontrada</Text> } as any)}
          />
        </View>
      </View>
    </Modal>
  );

  const renderFornecedorModal = () => (
    <Modal visible={showFornecedorModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Fornecedor</Text>
            <TouchableOpacity onPress={() => setShowFornecedorModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <TextInput style={[styles.input, { marginBottom: 8 }]} placeholder="Pesquisar fornecedor..." value={fornecedorSearch} onChangeText={setFornecedorSearch} autoCapitalize="none" autoCorrect={false} />
          <FlatList data={fornecedores.filter(f => f.nome?.toLowerCase().includes(fornecedorSearch.toLowerCase()))} keyExtractor={(i: Fornecedor) => i.id}
            renderItem={({ item }: { item: Fornecedor }) => (
              <TouchableOpacity style={[styles.machineItem, fornecedorId === item.id && styles.machineItemActive]}
                onPress={() => { setFornecedorId(item.id); setFornecedorNome(item.nome); setShowFornecedorModal(false); setFornecedorSearch(''); }}>
                <Text style={[styles.machineItemText, fornecedorId === item.id && styles.machineItemTextActive]}>{item.nome}</Text>
                {fornecedorId === item.id && <Ionicons name="checkmark" size={20} color="#fff" />}
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={{ color: '#999', textAlign: 'center', marginTop: 20 }}>Nenhum fornecedor encontrado</Text>}
          />
        </View>
      </View>
    </Modal>
  );

  const formContent = (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.optionRow}>
          {tipos.map(t => (
            <TouchableOpacity key={t} style={[styles.optionBtn, tipo === t && styles.optionBtnActive]} onPress={() => setTipo(t)}>
              <Text style={[styles.optionText, tipo === t && styles.optionTextActive]}>{t.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Prioridade</Text>
        <View style={styles.optionRow}>
          {prioridades.map(p => (
            <TouchableOpacity key={p} style={[styles.optionBtn, prioridade === p && styles.optionBtnActive]} onPress={() => setPrioridade(p)}>
              <Text style={[styles.optionText, prioridade === p && styles.optionTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Máquina</Text>
        <TouchableOpacity style={styles.machineSelector} onPress={() => setShowMachineModal(true)}>
          <Text style={[styles.machineSelectorText, !maquinaId && { color: '#bbb' }]}>
            {maquinaNome || 'Selecionar máquina...'}
          </Text>
          <Ionicons name="search" size={20} color="#999" />
        </TouchableOpacity>

        <Text style={styles.label}>Problema Relatado *</Text>
        <TextInput style={[styles.input, styles.textArea]} value={problemaRelatado} onChangeText={setProblemaRelatado} multiline numberOfLines={4} placeholder="Descreva o problema..." placeholderTextColor="#ccc" />

        <Text style={styles.label}>Data Abertura</Text>
        <TextInput style={styles.input} value={dataAbertura} onChangeText={t => setDataAbertura(validateDate(t))}
          placeholder="DD/MM/AAAA" placeholderTextColor="#ccc" keyboardType="numeric" maxLength={10} />

        <Text style={styles.label}>Data Máxima</Text>
        <View style={styles.dataMaximaRow}>
          <TextInput style={[styles.input, { flex: 1 }]} value={dataMaxima} onChangeText={t => setDataMaxima(validateDate(t))}
            placeholder="DD/MM/AAAA" placeholderTextColor="#ccc" keyboardType="numeric" maxLength={10} editable={!dataMaximaInfinita} />
          <TouchableOpacity style={[styles.infiniteBtn, dataMaximaInfinita && styles.infiniteBtnActive]} onPress={() => setDataMaximaInfinita(!dataMaximaInfinita)}>
            <Ionicons name="infinite" size={20} color={dataMaximaInfinita ? '#fff' : '#666'} />
            <Text style={[styles.infiniteBtnText, dataMaximaInfinita && styles.infiniteBtnTextActive]}>Infinito</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Fornecedor / Terceiro</Text>
        <TouchableOpacity style={styles.machineSelector} onPress={() => setShowFornecedorModal(true)}>
          <Text style={[styles.machineSelectorText, !fornecedorId && { color: '#bbb' }]}>
            {fornecedorNome || 'Selecionar fornecedor...'}
          </Text>
          <Ionicons name="search" size={20} color="#999" />
        </TouchableOpacity>

        <Text style={styles.label}>Observações do Terceiro</Text>
        <TextInput style={[styles.input, styles.textArea]} value={observacoesTerceiro} onChangeText={setObservacoesTerceiro} multiline numberOfLines={3} placeholder="Observações sobre o terceiro..." placeholderTextColor="#ccc" />

        <Text style={styles.label}>Observações</Text>
        <TextInput style={[styles.input, styles.textArea]} value={observacoes} onChangeText={setObservacoes} multiline numberOfLines={3} placeholder="Observações adicionais..." placeholderTextColor="#ccc" />

        <View style={styles.custosSection}>
          <View style={styles.custosHeader}>
            <Text style={styles.sectionTitle}>Custos</Text>
            <TouchableOpacity style={styles.addItemBtn} onPress={addCustoItem}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addItemBtnText}>Adicionar Item</Text>
            </TouchableOpacity>
          </View>

          {itensCusto.map((item, index) => (
            <View key={index}>
              <View style={styles.custoItemRow}>
                <TextInput style={[styles.input, { flex: 2, marginRight: 6 }]} value={item.descricao}
                  onChangeText={t => updateCustoItem(index, 'descricao', t)} placeholder="Descrição" placeholderTextColor="#ccc" />
                <TouchableOpacity onPress={() => removeCustoItem(index)}>
                  <Ionicons name="trash-outline" size={18} color="#d32f2f" />
                </TouchableOpacity>
              </View>
              <View style={styles.custoSubRow}>
                <TextInput style={[styles.input, { flex: 1, marginRight: 6 }]} value={item.unidade}
                  onChangeText={t => updateCustoItem(index, 'unidade', t)} placeholder="Unid." placeholderTextColor="#ccc" keyboardType="decimal-pad" />
                <TextInput style={[styles.input, { flex: 1, marginRight: 6 }]} value={item.valorUnitario}
                  onChangeText={t => updateCustoItem(index, 'valorUnitario', t)} placeholder="Valor unit." placeholderTextColor="#ccc" keyboardType="decimal-pad" />
                <Text style={styles.itemTotal}>R$ {(parseBr(item.unidade) * parseBr(item.valorUnitario)).toFixed(2)}</Text>
              </View>
            </View>
          ))}

          {itensCusto.length > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>R$ {totalCustos.toFixed(2)}</Text>
            </View>
          )}
        </View>

        <View style={styles.anexosSection}>
          <Text style={styles.sectionTitle}>Anexos</Text>
          <View style={styles.addMediaRow}>
            <TouchableOpacity style={styles.addMediaBtn} onPress={pickFromGallery} disabled={uploading}>
              <Ionicons name="images-outline" size={16} color="#fff" />
              <Text style={styles.addMediaText}>  Galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addMediaBtn} onPress={pickFromCamera} disabled={uploading}>
              <Ionicons name="camera-outline" size={16} color="#fff" />
              <Text style={styles.addMediaText}>  Câmera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addMediaBtn} onPress={pickDocument} disabled={uploading}>
              <Ionicons name="document-attach-outline" size={16} color="#fff" />
              <Text style={styles.addMediaText}>  Anexo</Text>
            </TouchableOpacity>
          </View>
          {uploading && <ActivityIndicator size="small" color="#1c1c1c" style={{ marginTop: 4 }} />}
          {anexos.length > 0 && (
            <View style={styles.anexosGrid}>
              {anexos.filter(a => a.tipo?.startsWith('image/')).map(a => (
                <View key={a.id} style={styles.anexoItem}>
                  <TouchableOpacity onPress={() => Linking.openURL(a.url)}>
                    <Image source={{ uri: a.url }} style={styles.anexoThumb} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.anexoRemoveBtn} onPress={() => setAnexos(prev => prev.filter(x => x.id !== a.id))}>
                    <Ionicons name="close-circle" size={20} color="#d32f2f" />
                  </TouchableOpacity>
                  <Text style={styles.anexoName} numberOfLines={1}>{a.nomeOriginal}</Text>
                </View>
              ))}
              {anexos.filter(a => !a.tipo?.startsWith('image/')).map(a => (
                <View key={a.id} style={styles.docRow}>
                  <TouchableOpacity style={styles.docItem} onPress={() => Linking.openURL(a.url)}>
                    <Ionicons name="document-outline" size={20} color="#666" />
                    <Text style={styles.docItemText} numberOfLines={1}>{a.nomeOriginal}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setAnexos(prev => prev.filter(x => x.id !== a.id))}>
                    <Ionicons name="close-circle" size={20} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{(params as any).id ? 'Salvar' : 'Abrir OS'}</Text>}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {renderMachineModal()}
      {renderFornecedorModal()}
      {Platform.OS !== 'web' ? <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{formContent}</TouchableWithoutFeedback> : formContent}
    </KeyboardAvoidingView>
  );
};

export default OSFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  form: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  optionBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  optionBtnActive: { backgroundColor: '#1c1c1c', borderColor: '#1c1c1c' },
  optionText: { fontSize: 12, color: '#666' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  machineSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  machineSelectorText: { fontSize: 15, color: '#333', flex: 1 },
  dataMaximaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infiniteBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', gap: 4 },
  infiniteBtnActive: { backgroundColor: '#1c1c1c', borderColor: '#1c1c1c' },
  infiniteBtnText: { fontSize: 12, color: '#666', fontWeight: '600' },
  infiniteBtnTextActive: { color: '#fff' },
  custosSection: { marginTop: 16, backgroundColor: '#fff', borderRadius: 10, padding: 14, elevation: 1 },
  custosHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  addItemBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  addItemBtnText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  custoItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  custoSubRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemTotal: { fontSize: 13, fontWeight: '700', color: '#2e7d32', minWidth: 70, textAlign: 'right' },
  removeItemBtn: { padding: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  totalLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginRight: 8 },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#2e7d32' },
  anexosSection: { marginTop: 16, backgroundColor: '#fff', borderRadius: 10, padding: 14, elevation: 1 },
  anexosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  addMediaRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  addMediaBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#555', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addMediaText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  anexoItem: { width: 100, position: 'relative' },
  anexoThumb: { width: 100, height: 80, borderRadius: 6, backgroundColor: '#e0e0e0', resizeMode: 'cover' },
  anexoRemoveBtn: { position: 'absolute', top: -6, right: -6, backgroundColor: '#fff', borderRadius: 10 },
  anexoName: { fontSize: 10, color: '#555', textAlign: 'center', marginTop: 2 },
  docRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 4 },
  docItem: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#f9f9f9', borderRadius: 6, marginVertical: 2, flex: 1 },
  docItemText: { fontSize: 13, color: '#333', marginLeft: 6, flex: 1 },
  saveBtn: { backgroundColor: '#1c1c1c', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  modalSearch: { backgroundColor: '#f5f5f5', margin: 12, padding: 12, borderRadius: 8, fontSize: 15 },
  machineItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, marginHorizontal: 12, marginVertical: 3, borderRadius: 8, backgroundColor: '#f9f9f9' },
  machineItemActive: { backgroundColor: '#1c1c1c' },
  machineItemText: { fontSize: 14, color: '#333' },
  machineItemTextActive: { color: '#fff', fontWeight: '600' },
});
