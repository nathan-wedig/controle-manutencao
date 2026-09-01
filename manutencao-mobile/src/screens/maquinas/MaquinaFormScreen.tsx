import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
  ActivityIndicator, Modal, Image, Linking, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { maquinasApi } from '../../api/maquinas';
import { fornecedoresApi } from '../../api/fornecedores';
import { setoresApi, Setor } from '../../api/setores';
import { uploadApi, UploadResult } from '../../api/upload';
import { MaquinasStackParamList } from '../../navigation/MainTabNavigator';
import FormField from '../../components/FormField';
import AnexoCard from '../../components/AnexoCard';
import QRCodeView from '../../components/QRCodeView';
import { Ionicons } from '@expo/vector-icons';
import { Pasta } from '../../types';
import { FILES_BASE_URL } from '../../config';

const statusOptions = ['ATIVA', 'EM_MANUTENCAO', 'PARADA', 'DESATIVADA'];

type FormScreenRouteProp = RouteProp<MaquinasStackParamList, 'MaquinaForm'>;
type FormScreenNavProp = NativeStackNavigationProp<MaquinasStackParamList, 'MaquinaForm'>;

const MaquinaFormScreen: React.FC = () => {
  const route = useRoute<FormScreenRouteProp>();
  const navigation = useNavigation<FormScreenNavProp>();
  const editId = route.params?.id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [codigoMaquina, setCodigoMaquina] = useState('');
  const [apr, setApr] = useState('');
  const [nr12, setNr12] = useState('');
  const [nome, setNome] = useState('');
  const [setor, setSetor] = useState('');
  const [fonteEnergia, setFonteEnergia] = useState('');
  const [nomeOperador, setNomeOperador] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [anoFabricacao, setAnoFabricacao] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [cnpjFabricante, setCnpjFabricante] = useState('');
  const [modelo, setModelo] = useState('');
  const [peso, setPeso] = useState('');
  const [dataCompra, setDataCompra] = useState('');
  const [dataGarantia, setDataGarantia] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState('ATIVA');
  const [qrcodeHash, setQrcodeHash] = useState('');
  const [anexos, setAnexos] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [selectedFornecedores, setSelectedFornecedores] = useState<{ fornecedorId: string; fornecedorNome: string; observacao: string }[]>([]);
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [fornecedorSearch, setFornecedorSearch] = useState('');
  const [pastas, setPastas] = useState<Pasta[]>([]);
  const [showPastaModal, setShowPastaModal] = useState(false);
  const [newPastaNome, setNewPastaNome] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveAnexoId, setMoveAnexoId] = useState<string | null>(null);
  const [setorSearch, setSetorSearch] = useState('');

  useEffect(() => { setoresApi.listar().then(setSetores).catch(() => {}); }, []);

  useFocusEffect(useCallback(() => {
    fornecedoresApi.listar().then(setFornecedores).catch(() => {});
    if (!editId) return;
    setLoading(true);
    navigation.setOptions({ title: 'Editar Máquina' });
    maquinasApi.buscarPorId(editId).then(d => {
      setCodigoMaquina(d.codigoMaquina);
      setApr(d.apr || '');
      setNr12(d.nr12 || '');
      setNome(d.nome);
      setSetor(d.setor || '');
      setFonteEnergia(d.fonteEnergia || '');
      setNomeOperador(d.nomeOperador || '');
      setNumeroSerie(d.numeroSerie || '');
      setAnoFabricacao(d.anoFabricacao || '');
      setFabricante(d.fabricante || '');
      setCnpjFabricante(d.cnpjFabricante || '');
      setModelo(d.modelo || '');
      setPeso(d.peso || '');
      setDataCompra(d.dataCompra ? d.dataCompra.split('-').reverse().join('/') : '');
      setDataGarantia(d.dataGarantia ? d.dataGarantia.split('-').reverse().join('/') : '');
      setObservacoes(d.observacoes || '');
      setStatus(d.status);
      setQrcodeHash(d.qrcodeHash || '');
      if (d.anexos) setAnexos(d.anexos.map((a: any) => ({ id: a.id, url: FILES_BASE_URL + a.url, nomeOriginal: a.nomeOriginal, tipo: a.tipo, extensao: a.extensao, tamanho: a.tamanho, categoria: a.categoria, pastaId: a.pastaId, pastaNome: a.pastaNome })));
      maquinasApi.listarFornecedores(editId).then((fs: any[]) => {
        setSelectedFornecedores(fs.map((f: any) => ({ fornecedorId: f.id, fornecedorNome: f.nome, observacao: f.observacao || '' })));
      }).catch(() => {});
      maquinasApi.listarPastas(editId).then(setPastas).catch(() => {});
    }).catch(() => Alert.alert('Erro', 'Não foi possível carregar')).finally(() => setLoading(false));
  }, [editId]));

   // Sanitize filename to remove special characters that might cause issues
   const sanitizeFileName = (fileName: string): string => {
     // Remove special characters but keep letters, numbers, dots, hyphens and underscores
     return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
   };

   const doUpload = async (uri: string, name: string, mimeType: string, categoria: string) => {
     setUploading(true);
     try {
       const sanitizedName = sanitizeFileName(name);
       const uploaded = await uploadApi.upload(uri, sanitizedName, mimeType, categoria, editId);
       setAnexos(prev => [...prev, { ...uploaded, url: FILES_BASE_URL + uploaded.url }]);
     } catch (e: any) {
       Alert.alert('Erro', e.message || 'Falha ao fazer upload');
     } finally {
       setUploading(false);
     }
   };

   const pickFromGallery = async () => {
     try {
       // Request media library permissions first
       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
       if (status !== 'granted') {
         Alert.alert('Permissão necessária', 'Permita o acesso à galeria nas configurações');
         return;
       }
       
       const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
       if (!result.canceled && result.assets[0]) {
         const a = result.assets[0];
         // Ensure we have a valid filename, fallback to a timestamp-based name if needed
         const fileName = a.fileName ? a.fileName.trim() : `foto_${Date.now()}.jpg`;
         doUpload(a.uri, fileName, a.mimeType || 'image/jpeg', 'imagem');
       }
     } catch (error) {
       Alert.alert('Erro', error.message || 'Falha ao acessar a galeria');
     }
   };

   const pickFromCamera = async () => {
     try {
       // Request camera permissions
       const { status } = await ImagePicker.requestCameraPermissionsAsync();
       if (status !== 'granted') {
         Alert.alert('Permissão necessária', 'Permita o acesso à câmera nas configurações');
         return;
       }
       
       const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
       if (!result.canceled && result.assets[0]) {
         const a = result.assets[0];
         doUpload(a.uri, a.fileName || `foto_${Date.now()}.jpg`, a.mimeType || 'image/jpeg', 'imagem');
       }
     } catch (error) {
       Alert.alert('Erro', error.message || 'Falha ao acessar a câmera');
     }
   };

   const pickDocument = async () => {
     try {
       const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
       if (!result.canceled && result.assets[0]) {
         const a = result.assets[0];
         doUpload(a.uri, a.name, a.mimeType || 'application/octet-stream', 'documento');
       }
     } catch (error) {
       Alert.alert('Erro', error.message || 'Falha ao acessar documentos');
     }
   };

  const setCover = (id: string) => {
    setAnexos(prev => prev.map(a => ({ ...a, categoria: a.id === id ? 'capa' : '' })));
  };

  const removeAnexo = (id: string) => {
    setAnexos(prev => prev.filter(a => a.id !== id));
  };

  const handleCriarPasta = async () => {
    if (!newPastaNome.trim() || !editId) return;
    try {
      const pasta = await maquinasApi.criarPasta(editId, newPastaNome.trim());
      setPastas(prev => [...prev, pasta]);
      setNewPastaNome('');
      setShowPastaModal(false);
    } catch { Alert.alert('Erro', 'Falha ao criar pasta'); }
  };

  const handleDeletarPasta = (pastaId: string) => {
    if (!editId) return;
    Alert.alert('Excluir Pasta', 'Tem certeza? Os anexos serão movidos para a raiz.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await maquinasApi.deletarPasta(editId, pastaId);
          setPastas(prev => prev.filter(p => p.id !== pastaId));
          setAnexos(prev => prev.map(a => a.pastaId === pastaId ? { ...a, pastaId: undefined, pastaNome: undefined } : a));
        } catch { Alert.alert('Erro', 'Falha ao excluir pasta'); }
      }},
    ]);
  };

  const handleMoverAnexo = (anexoId: string) => {
    setMoveAnexoId(anexoId);
    setShowMoveModal(true);
  };

  const confirmarMover = async (pastaId?: string) => {
    if (!editId || !moveAnexoId) return;
    try {
      await maquinasApi.moverAnexo(editId, moveAnexoId, pastaId);
      const pasta = pastaId ? pastas.find(p => p.id === pastaId) : undefined;
      setAnexos(prev => prev.map(a => a.id === moveAnexoId ? { ...a, pastaId, pastaNome: pasta?.nome } : a));
      setShowMoveModal(false);
      setMoveAnexoId(null);
    } catch { Alert.alert('Erro', 'Falha ao mover anexo'); }
  };

  const downloadFile = useCallback((url: string, nome: string) => {
    if (Platform.OS === 'web') {
      const a = document.createElement('a');
      a.href = url;
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      Linking.openURL(url);
    }
  }, []);

  const handleSave = async () => {
    if (!codigoMaquina || !nome) { Alert.alert('Erro', 'Código e Nome são obrigatórios'); return; }
    setSaving(true);
    try {
      const formatDate = (d: string) => d.length === 10 ? d.split('/').reverse().join('-') : '';
      const anexosPayload = anexos.map(a => ({ id: a.id, categoria: a.categoria || '', pastaId: a.pastaId || null }));
      const payloadData: any = { codigoMaquina, nome, observacoes, status, anexos: anexosPayload, fornecedores: selectedFornecedores.filter(f => f.fornecedorId).map(f => ({ fornecedorId: f.fornecedorId, observacao: f.observacao })) };
      if (apr) payloadData.apr = apr;
      if (nr12) payloadData.nr12 = nr12;
      if (setor) payloadData.setor = setor;
      if (fonteEnergia) payloadData.fonteEnergia = fonteEnergia;
      if (nomeOperador) payloadData.nomeOperador = nomeOperador;
      if (numeroSerie) payloadData.numeroSerie = numeroSerie;
      if (anoFabricacao) payloadData.anoFabricacao = anoFabricacao;
      if (fabricante) payloadData.fabricante = fabricante;
      if (cnpjFabricante) payloadData.cnpjFabricante = cnpjFabricante;
      if (modelo) payloadData.modelo = modelo;
      if (peso) payloadData.peso = peso;
      const fc = formatDate(dataCompra);
      if (fc) payloadData.dataCompra = fc;
      const fg = formatDate(dataGarantia);
      if (fg) payloadData.dataGarantia = fg;
      if (editId) {
        await maquinasApi.atualizar(editId, payloadData);
      } else {
        await maquinasApi.criar(payloadData);
      }
      navigation.goBack();
    } catch (error: any) { Alert.alert('Erro', error.response?.data?.erro || error.response?.data?.error || 'Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const formatCNPJ = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  const validateDate = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#1c1c1c" /></View>;

  const formContent = (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        <FormField label="Nº Patrimônio *" value={codigoMaquina} onChangeText={setCodigoMaquina} />
        <View style={styles.row}>
          <View style={styles.half}><FormField label="APR" value={apr} onChangeText={setApr} /></View>
          <View style={styles.half}><FormField label="NR 12" value={nr12} onChangeText={setNr12} /></View>
        </View>
        <FormField label="Fonte de Energia" value={fonteEnergia} onChangeText={setFonteEnergia} />
        <FormField label="Descrição Máquina/Equipamento *" value={nome} onChangeText={setNome} />
        <FormField label="Nome Operador" value={nomeOperador} onChangeText={setNomeOperador} />
  
        <Text style={styles.label}>Setor</Text>
        <TouchableOpacity style={styles.pickerBtn} onPress={() => setPickerOpen(true)}>
          <Text style={[styles.pickerText, !setor && styles.pickerPlaceholder]}>
            {setor || 'Selecione um setor'}
          </Text>
        </TouchableOpacity>
  
        <View style={styles.row}>
          <View style={styles.half}><FormField label="Nº Série" value={numeroSerie} onChangeText={setNumeroSerie} /></View>
          <View style={styles.half}><FormField label="Fabricante" value={fabricante} onChangeText={setFabricante} /></View>
        </View>
        <View style={styles.row}>
          <View style={styles.half}><FormField label="Modelo" value={modelo} onChangeText={setModelo} /></View>
          <View style={styles.half}><FormField label="CNPJ Fabricante" value={cnpjFabricante} onChangeText={t => setCnpjFabricante(formatCNPJ(t))} placeholder="XX.XXX.XXX/XXXX-XX" /></View>
        </View>
        <View style={styles.row}>
          <View style={styles.half}><FormField label="Ano Fabricação" value={anoFabricacao} onChangeText={setAnoFabricacao} placeholder="AAAA" /></View>
          <View style={styles.half}><FormField label="Peso (kg)" value={peso} onChangeText={setPeso} keyboardType="numeric" /></View>
        </View>
        <View style={styles.row}>
          <View style={styles.half}><FormField label="Data Compra" value={dataCompra} onChangeText={(t: string) => setDataCompra(validateDate(t))} placeholder="DD/MM/AAAA" /></View>
          <View style={styles.half}><FormField label="Garantia" value={dataGarantia} onChangeText={(t: string) => setDataGarantia(validateDate(t))} placeholder="DD/MM/AAAA" /></View>
        </View>
        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          {statusOptions.map(s => (
            <TouchableOpacity key={s} style={[styles.statusBtn, status === s && styles.statusBtnActive]} onPress={() => setStatus(s)}>
              <Text style={[styles.statusText, status === s && styles.statusTextActive]}>{s.replace('_', ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FormField label="Observações" value={observacoes} onChangeText={setObservacoes} textarea />
 
        {editId && (
          <>
            <View style={styles.pastaHeader}>
              <Text style={styles.label}>Pastas</Text>
              <TouchableOpacity style={styles.addPastaBtn} onPress={() => setShowPastaModal(true)}>
                <Ionicons name="folder-open-outline" size={16} color="#fff" />
                <Text style={styles.addPastaBtnText}>Nova Pasta</Text>
              </TouchableOpacity>
            </View>

            {pastas.length > 0 && pastas.map(pasta => (
              <View key={pasta.id} style={styles.pastaSection}>
                <View style={styles.pastaTitleRow}>
                  <Ionicons name="folder" size={18} color="#555" />
                  <Text style={styles.pastaTitle}>{pasta.nome}</Text>
                  <TouchableOpacity onPress={() => handleDeletarPasta(pasta.id)} style={styles.anexoBtnDel}>
                    <Ionicons name="trash-outline" size={14} color="#d32f2f" />
                  </TouchableOpacity>
                </View>
                {anexos.filter(a => a.pastaId === pasta.id).map(a => (
                  <AnexoCard
                    key={a.id} a={a} isImage={!!a.tipo?.startsWith('image/')}
                    onDownload={() => downloadFile(a.url, a.nomeOriginal || 'arquivo')}
                    onStar={a.tipo?.startsWith('image/') ? () => setCover(a.id) : undefined}
                    onMove={() => handleMoverAnexo(a.id)}
                    onRemove={() => removeAnexo(a.id)}
                  />
                ))}
                {anexos.filter(a => a.pastaId === pasta.id).length === 0 && (
                  <Text style={styles.pastaEmpty}>Pasta vazia</Text>
                )}
              </View>
            ))}

            {anexos.filter(a => !a.pastaId).length > 0 && (
              <View style={styles.pastaSection}>
                <View style={styles.pastaTitleRow}>
                  <Ionicons name="folder" size={18} color="#999" />
                  <Text style={[styles.pastaTitle, { color: '#999' }]}>Raiz</Text>
                </View>
                {anexos.filter(a => !a.pastaId).map(a => (
                  <AnexoCard
                    key={a.id} a={a} isImage={!!a.tipo?.startsWith('image/')}
                    onDownload={() => downloadFile(a.url, a.nomeOriginal || 'arquivo')}
                    onStar={a.tipo?.startsWith('image/') ? () => setCover(a.id) : undefined}
                    onMove={() => handleMoverAnexo(a.id)}
                    onRemove={() => removeAnexo(a.id)}
                  />
                ))}
              </View>
            )}
          </>
        )}
 
        <View style={styles.addMediaRow}>
          <TouchableOpacity style={styles.addMediaBtn} onPress={pickFromGallery} disabled={uploading}>
            <Ionicons name="images-outline" size={18} color="#fff" />
            <Text style={styles.addMediaText}>  Galeria</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addMediaBtn} onPress={pickFromCamera} disabled={uploading}>
            <Ionicons name="camera-outline" size={18} color="#fff" />
            <Text style={styles.addMediaText}>  Câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addMediaBtn} onPress={pickDocument} disabled={uploading}>
            <Ionicons name="document-attach-outline" size={18} color="#fff" />
            <Text style={styles.addMediaText}>  Anexo</Text>
          </TouchableOpacity>
        </View>
        {uploading && <ActivityIndicator size="small" color="#1c1c1c" style={{ marginTop: 8 }} />}
 
        <Text style={styles.label}>Fornecedores Associados</Text>
        {selectedFornecedores.map((sf, idx) => (
          <View key={idx} style={styles.fornecedorRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fornecedorNomeText}>{sf.fornecedorNome}</Text>
              <TextInput style={[styles.input, { marginTop: 4 }]} value={sf.observacao} onChangeText={t => {
                const updated = [...selectedFornecedores];
                updated[idx] = { ...updated[idx], observacao: t };
                setSelectedFornecedores(updated);
              }} placeholder="Observação..." placeholderTextColor="#ccc" />
            </View>
            <TouchableOpacity onPress={() => setSelectedFornecedores(prev => prev.filter((_, i) => i !== idx))}>
              <Ionicons name="trash-outline" size={20} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addFornecedorBtn} onPress={() => setShowFornecedorModal(true)}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addFornecedorBtnText}>Adicionar Fornecedor</Text>
        </TouchableOpacity>

        {editId && qrcodeHash && <QRCodeView value={qrcodeHash} label="QR Code da Máquina" />}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{editId ? 'Atualizar' : 'Cadastrar'}</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {Platform.OS !== 'web' ? <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{formContent}</TouchableWithoutFeedback> : formContent}
      <Modal visible={pickerOpen} animationType="slide" transparent>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Selecionar Setor</Text>
                <TouchableOpacity onPress={() => setPickerOpen(false)}><Text style={styles.pickerDone}>Fechar</Text></TouchableOpacity>
              </View>
              <TextInput style={[styles.input, { marginBottom: 8 }]} placeholder="Pesquisar setor..." value={setorSearch} onChangeText={setSetorSearch} autoCapitalize="none" autoCorrect={false} />
              {setores.length === 0 ? (
                <Text style={styles.pickerEmpty}>Nenhum setor cadastrado</Text>
              ) : (
                <ScrollView style={{ maxHeight: 300 }}>
                  {setores.filter(s => s.nome?.toLowerCase().includes(setorSearch.toLowerCase())).map(s => (
                    <TouchableOpacity key={s.id} style={[styles.pickerItem, setor === s.nome && styles.pickerItemActive]}
                      onPress={() => { setSetor(s.nome); setPickerOpen(false); }}>
                      <Text style={[styles.pickerItemText, setor === s.nome && styles.pickerItemTextActive]}>{s.nome}</Text>
                      {setor === s.nome && <Text style={styles.pickerCheck}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                  {setores.filter(s => s.nome?.toLowerCase().includes(setorSearch.toLowerCase())).length === 0 && (
                    <Text style={styles.pickerEmpty}>Nenhum setor encontrado</Text>
                  )}
                </ScrollView>
              )}
              <TouchableOpacity style={styles.pickerClear} onPress={() => { setSetor(''); setPickerOpen(false); }}>
                <Text style={styles.pickerClearText}>Limpar setor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={showFornecedorModal} animationType="slide" transparent>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Selecionar Fornecedor</Text>
                <TouchableOpacity onPress={() => setShowFornecedorModal(false)}><Text style={styles.pickerDone}>Fechar</Text></TouchableOpacity>
              </View>
              <TextInput style={[styles.input, { marginBottom: 8 }]} placeholder="Pesquisar fornecedor..." value={fornecedorSearch} onChangeText={setFornecedorSearch} autoCapitalize="none" autoCorrect={false} />
              {fornecedores.length === 0 ? (
                <Text style={styles.pickerEmpty}>Nenhum fornecedor cadastrado</Text>
              ) : (
                <ScrollView style={{ maxHeight: 300 }}>
                  {fornecedores.filter(f => f.nome?.toLowerCase().includes(fornecedorSearch.toLowerCase())).map(f => {
                    const alreadyAdded = selectedFornecedores.some(sf => sf.fornecedorId === f.id);
                    return (
                      <TouchableOpacity key={f.id} style={[styles.pickerItem, alreadyAdded && { opacity: 0.4 }]}
                        disabled={alreadyAdded}
                        onPress={() => {
                          setSelectedFornecedores(prev => [...prev, { fornecedorId: f.id, fornecedorNome: f.nome, observacao: '' }]);
                          setShowFornecedorModal(false);
                          setFornecedorSearch('');
                        }}>
                        <Text style={styles.pickerItemText}>{f.nome}</Text>
                        {alreadyAdded ? <Ionicons name="checkmark" size={20} color="#999" /> : null}
                      </TouchableOpacity>
                    );
                  })}
                  {fornecedores.filter(f => f.nome?.toLowerCase().includes(fornecedorSearch.toLowerCase())).length === 0 && (
                    <Text style={styles.pickerEmpty}>Nenhum fornecedor encontrado</Text>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
        <Modal visible={showPastaModal} animationType="slide" transparent>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Nova Pasta</Text>
                <TouchableOpacity onPress={() => { setShowPastaModal(false); setNewPastaNome(''); }}><Text style={styles.pickerDone}>Cancelar</Text></TouchableOpacity>
              </View>
              <TextInput style={styles.input} value={newPastaNome}
                onChangeText={setNewPastaNome} placeholder="Nome da pasta" autoFocus />
              <TouchableOpacity style={styles.saveBtn} onPress={handleCriarPasta}>
                <Text style={styles.saveBtnText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={showMoveModal} animationType="slide" transparent>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Mover para pasta</Text>
                <TouchableOpacity onPress={() => { setShowMoveModal(false); setMoveAnexoId(null); }}><Text style={styles.pickerDone}>Cancelar</Text></TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.pickerItem} onPress={() => confirmarMover(undefined)}>
                <Ionicons name="folder" size={18} color="#999" />
                <Text style={styles.pickerItemText}>Raiz (sem pasta)</Text>
              </TouchableOpacity>
              {pastas.map(p => (
                <TouchableOpacity key={p.id} style={styles.pickerItem} onPress={() => confirmarMover(p.id)}>
                  <Ionicons name="folder" size={18} color="#555" />
                  <Text style={styles.pickerItemText}>{p.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
    </KeyboardAvoidingView>
  );
};

export default MaquinaFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  form: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  pickerBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  pickerText: { fontSize: 15, color: '#333' },
  pickerPlaceholder: { color: '#999' },
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerModal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pickerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  pickerDone: { fontSize: 15, color: '#1c1c1c', fontWeight: '600' },
  pickerEmpty: { textAlign: 'center', color: '#999', padding: 20 },
  pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerItemActive: { backgroundColor: '#e8f0fe' },
  pickerItemText: { fontSize: 16, color: '#333' },
  pickerItemTextActive: { color: '#1c1c1c', fontWeight: '600' },
  pickerCheck: { fontSize: 18, color: '#1c1c1c', fontWeight: 'bold' },
  pickerClear: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  pickerClearText: { fontSize: 14, color: '#d32f2f', fontWeight: '600' },
  aprRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  aprBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', alignItems: 'center' },
  aprBtnActive: { backgroundColor: '#1c1c1c', borderColor: '#1c1c1c' },
  aprBtnText: { fontSize: 14, color: '#666', fontWeight: '600' },
  aprBtnTextActive: { color: '#fff' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff' },
  statusBtnActive: { backgroundColor: '#1c1c1c', borderColor: '#1c1c1c' },
  statusText: { fontSize: 13, color: '#666' },
  statusTextActive: { color: '#fff', fontWeight: '600' },
  anexosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  anexoCard: { width: 100, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  anexoThumb: { width: 100, height: 80, resizeMode: 'cover' },
  anexoFileIcon: { width: 100, height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  anexoName: { fontSize: 10, color: '#555', textAlign: 'center', paddingHorizontal: 4, paddingTop: 2 },
  docTouchArea: { alignItems: 'center' },
  anexoActions: { flexDirection: 'row', justifyContent: 'space-around', padding: 4 },
  anexoBtn: { padding: 4, borderRadius: 4 },
  anexoBtnActive: { backgroundColor: '#1c1c1c' },
  anexoBtnDel: { padding: 4 },
  capaBadge: { position: 'absolute', top: 4, left: 4, backgroundColor: '#1c1c1c', color: '#fff', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  addMediaRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  addMediaBtn: { flex: 1, flexDirection: 'row', backgroundColor: '#555', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  addMediaText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  saveBtn: { backgroundColor: '#1c1c1c', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  fornecedorRow: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 6, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0' },
  fornecedorNomeText: { fontSize: 14, fontWeight: '600', color: '#333' },
  addFornecedorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#555', padding: 10, borderRadius: 8, gap: 6, marginBottom: 8 },
  addFornecedorBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  pastaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  addPastaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#555', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, gap: 4 },
  addPastaBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  pastaSection: { backgroundColor: '#fff', borderRadius: 8, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  pastaTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  pastaTitle: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1 },
  pastaEmpty: { fontSize: 12, color: '#999', fontStyle: 'italic', padding: 8, textAlign: 'center' },
});
