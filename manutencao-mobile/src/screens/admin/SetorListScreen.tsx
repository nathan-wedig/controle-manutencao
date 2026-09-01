import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
  TextInput, Modal, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { setoresApi, Setor } from '../../api/setores';

const ModalInput = React.memo(({ label, value, onChangeText, placeholder, multiline }: any) => (
  <>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput style={[styles.input, multiline && { height: 80 }]} placeholder={placeholder}
      value={value} onChangeText={onChangeText} multiline={multiline} />
  </>
));

const SetorListScreen: React.FC = () => {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Setor | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const load = async () => {
    try {
      const data = await setoresApi.listar();
      setSetores(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!nome.trim()) { Alert.alert('Erro', 'Nome obrigatório'); return; }
    try {
      if (editItem) {
        await setoresApi.atualizar(editItem.id, { nome, descricao });
      } else {
        await setoresApi.criar({ nome, descricao });
      }
      setModalOpen(false);
      load();
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.error || 'Erro ao salvar');
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (!window.confirm('Tem certeza que deseja excluir este setor?')) return;
      (async () => { try { await setoresApi.deletar(id); load(); } catch { Alert.alert('Erro', 'Não foi possível excluir'); } })();
    } else {
      Alert.alert('Excluir', 'Tem certeza?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: async () => {
          try { await setoresApi.deletar(id); load(); } catch (e) { Alert.alert('Erro', 'Não foi possível excluir'); }
        }},
      ]);
    }
  };

  const openEdit = (s: Setor) => {
    setEditItem(s);
    setNome(s.nome);
    setDescricao(s.descricao);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setNome('');
    setDescricao('');
    setModalOpen(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Setores</Text>
      {loading ? <ActivityIndicator size="large" color="#1c1c1c" style={{ marginTop: 40 }} /> : (
        <FlatList data={setores} keyExtractor={(i: Setor) => i.id.toString()}
          renderItem={({ item }: { item: Setor }) => (
            <View style={styles.card}>
              <TouchableOpacity style={styles.cardPressable} onPress={() => openEdit(item)}>
                <Ionicons name="business-outline" size={24} color="#1c1c1c" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.nome}>{item.nome}</Text>
                  {item.descricao ? <Text style={styles.desc}>{item.descricao}</Text> : null}
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 8 }} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#d32f2f" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <TouchableOpacity style={styles.fab} onPress={openCreate}><Text style={styles.fabText}>+</Text></TouchableOpacity>

      <Modal visible={modalOpen} animationType="slide" transparent>
        {Platform.OS !== 'web' ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
                <Text style={styles.modalTitle}>{editItem ? 'Editar Setor' : 'Novo Setor'}</Text>
                <ModalInput label="Nome do setor" value={nome} onChangeText={setNome} placeholder="Ex: Usinagem" />
                <ModalInput label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Descrição opcional do setor" multiline />
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveText}>Salvar</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>{editItem ? 'Editar Setor' : 'Novo Setor'}</Text>
              <ModalInput label="Nome do setor" value={nome} onChangeText={setNome} placeholder="Ex: Usinagem" />
              <ModalInput label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="Descrição opcional do setor" multiline />
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveText}>Salvar</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
};

export default SetorListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', padding: 16, paddingBottom: 8 },
   card: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, padding: 14, borderRadius: 10, elevation: 2, flexDirection: 'row', alignItems: 'center' },
   cardPressable: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  nome: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  desc: { fontSize: 13, color: '#666', marginTop: 2 },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1c1c1c', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { fontSize: 28, color: '#fff', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 4 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#1c1c1c', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600' },
});
