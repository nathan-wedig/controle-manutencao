import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
  TextInput, Modal, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/MainTabNavigator';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { showAlert } from '../../utils/alert';

type NavProp = NativeStackNavigationProp<AdminStackParamList, 'AdminHome'>;

const AdminScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavProp>();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [nome, setNome] = useState('');
  const [password, setPassword] = useState('');
  const [cargo, setCargo] = useState('');
  const [role, setRole] = useState('USER');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');

  const load = async () => {
    try {
      const r = await api.get('/api/usuarios');
      setUsuarios(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setFormError('');
    if (!username.trim() || !nome.trim() || (!editUser && !password.trim())) {
      const msg = 'Preencha todos os campos obrigatórios (Username, Nome, Senha).';
      setFormError(msg);
      showAlert('Erro', msg);
      return;
    }
    try {
      const data = { username, nome, password, cargo, role, email };
      if (editUser) {
        await api.put(`/api/usuarios/${editUser.id}`, data);
      } else {
        await api.post('/api/usuarios', data);
      }
      setModalOpen(false);
      setFormError('');
      load();
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Erro ao salvar';
      setFormError(msg);
      showAlert('Erro', msg);
    }
  };

  const openEdit = (u: any) => {
    setEditUser(u);
    setFormError('');
    setUsername(u.username);
    setNome(u.nome);
    setPassword('');
    setCargo(u.cargo || '');
    setRole(u.role || 'USER');
    setEmail(u.email || '');
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditUser(null);
    setFormError('');
    setUsername('');
    setNome('');
    setPassword('');
    setCargo('');
    setRole('USER');
    setEmail('');
    setModalOpen(true);
  };

  if (user?.role === 'USER') {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={64} color="#d32f2f" />
        <Text style={styles.deniedText}>Acesso restrito</Text>
      </View>
    );
  }

  const roleColors: Record<string, string> = { ADMIN: '#333333', COORD: '#e65100', USER: '#757575' };

  return (
    <ScrollView style={styles.container}>
      {user?.role === 'ADMIN' && (
        <View style={styles.shortcuts}>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => navigation.navigate('Relatorios')}>
            <Ionicons name="bar-chart-outline" size={28} color="#1c1c1c" />
            <Text style={styles.shortcutLabel}>Relatório Custos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => navigation.navigate('Setores')}>
            <Ionicons name="business-outline" size={28} color="#1c1c1c" />
            <Text style={styles.shortcutLabel}>Setores</Text>
          </TouchableOpacity>
        </View>
      )}

      {user?.role === 'COORD' && (
        <View style={styles.coordBanner}>
          <Ionicons name="bar-chart-outline" size={40} color="#e65100" />
          <Text style={styles.coordTitle}>Relatórios de Custos</Text>
          <Text style={styles.coordSub}>Acesse os relatórios de custos mensais</Text>
          <TouchableOpacity style={styles.coordBtn} onPress={() => navigation.navigate('Relatorios')}>
            <Text style={styles.coordBtnText}>Ver Relatórios</Text>
          </TouchableOpacity>
        </View>
      )}

      {user?.role === 'ADMIN' && (
        <>
          <Text style={styles.title}>Usuários</Text>
          {loading ? <ActivityIndicator size="large" color="#1c1c1c" style={{ marginTop: 20 }} /> : (
            <>
              {usuarios.map(item => (
                <TouchableOpacity key={item.id} style={styles.card} onPress={() => openEdit(item)}>
                  <View style={styles.cardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nome}>{item.nome}</Text>
                      <Text style={styles.username}>@{item.username}</Text>
                      <Text style={styles.info}>{item.cargo} • {item.role}</Text>
                    </View>
                    <View style={[styles.roleBadge, { backgroundColor: roleColors[item.role] || '#757575' }]}>
                      <Text style={styles.roleText}>{item.role}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
          <View style={{ height: 80 }} />

          <Modal visible={modalOpen} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modal}>
              <Text style={styles.modalTitle}>{editUser ? 'Editar Usuário' : 'Novo Usuário'}</Text>
              <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput style={styles.input} placeholder="Ex: joao.silva" value={username} onChangeText={setUsername} />
              <Text style={styles.fieldLabel}>Nome completo</Text>
              <TextInput style={styles.input} placeholder="Ex: João Silva" value={nome} onChangeText={setNome} />
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput style={styles.input} placeholder="Ex: joao@empresa.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.fieldLabel}>Cargo</Text>
              <TextInput style={styles.input} placeholder="Ex: Técnico" value={cargo} onChangeText={setCargo} />
              <Text style={styles.fieldLabel}>Senha</Text>
              <TextInput style={styles.input} placeholder={editUser ? "Deixe vazio para manter" : "Ex: 123456"} value={password} onChangeText={setPassword} secureTextEntry />
              <Text style={styles.fieldLabel}>Permissão</Text>
              <View style={styles.roleRow}>
                {['USER', 'COORD', 'ADMIN'].map(r => (
                  <TouchableOpacity key={r} style={[styles.roleBtn, role === r && styles.roleBtnActive]} onPress={() => setRole(r)}>
                    <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {formError ? <Text style={styles.formError}>{formError}</Text> : null}
              </ScrollView>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveText}>Salvar</Text></TouchableOpacity>
              </View>
              </View>
            </View>
          </Modal>

          <TouchableOpacity style={styles.fab} onPress={openCreate}><Text style={styles.fabText}>+</Text></TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

export default AdminScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  deniedText: { fontSize: 16, color: '#666', marginTop: 16, textAlign: 'center' },
  shortcuts: { flexDirection: 'row', padding: 16, gap: 12 },
  shortcutCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, elevation: 2, alignItems: 'center', gap: 8 },
  shortcutLabel: { fontSize: 13, fontWeight: '600', color: '#333' },
  coordBanner: { alignItems: 'center', padding: 40, gap: 12 },
  coordTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  coordSub: { fontSize: 14, color: '#666', textAlign: 'center' },
  coordBtn: { backgroundColor: '#e65100', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8 },
  coordBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 4 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', paddingHorizontal: 16, paddingBottom: 8 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4, padding: 14, borderRadius: 10, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  nome: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  username: { fontSize: 13, color: '#666' },
  info: { fontSize: 12, color: '#999', marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1c1c1c', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6 },
  fabText: { fontSize: 28, color: '#fff', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  input: { backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#1c1c1c', borderColor: '#1c1c1c' },
  roleBtnText: { fontSize: 14, color: '#666', fontWeight: '600' },
  roleBtnTextActive: { color: '#fff' },
  formError: { color: '#c0392b', fontSize: 13, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  cancelText: { color: '#666', fontWeight: '600' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: '#1c1c1c', alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '600' },
});
