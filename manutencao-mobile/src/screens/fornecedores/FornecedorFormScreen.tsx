import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { fornecedoresApi } from '../../api/fornecedores';
import { Fornecedor } from '../../types';

type FormRouteParams = {
  FornecedorForm: { id?: string };
};

const FornecedorFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<FormRouteParams, 'FornecedorForm'>>();
  const editId = route.params?.id;
  const isEditing = !!editId;

  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');

  const formatCNPJ = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 14);
    return digits.replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };
  const [nomeRepresentante, setNomeRepresentante] = useState('');
  const [whatsappRepresentante, setWhatsappRepresentante] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [tipoServico, setTipoServico] = useState('');
  const [detalhesServico, setDetalhesServico] = useState('');
  const [formasPagamento, setFormasPagamento] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!editId) return;
    setLoading(true);
    fornecedoresApi.buscarPorId(editId)
      .then((data: Fornecedor) => {
        setNome(data.nome || '');
        setCnpj(data.cnpj || '');
        setNomeRepresentante(data.nomeRepresentante || '');
        setWhatsappRepresentante(data.whatsappRepresentante || '');
        setTelefone(data.telefone || '');
        setEmail(data.email || '');
        setTipoServico(data.tipoServico || '');
        setDetalhesServico(data.detalhesServico || '');
        setFormasPagamento(data.formasPagamento || '');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [editId]));

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do fornecedor');
      return;
    }

    setSaving(true);
    try {
      const data = { nome: nome.trim(), cnpj: cnpj.trim(), nomeRepresentante: nomeRepresentante.trim(), whatsappRepresentante: whatsappRepresentante.trim(), telefone: telefone.trim(), email: email.trim(), tipoServico: tipoServico.trim(), detalhesServico: detalhesServico.trim(), formasPagamento: formasPagamento.trim() };
      if (isEditing) {
        await fornecedoresApi.atualizar(editId!, data);
      } else {
        await fornecedoresApi.criar(data);
      }
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar o fornecedor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1c1c1c" />
      </View>
    );
  }

  const formContent = (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Nome do Fornecedor *</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome" placeholderTextColor="#999" />

      <Text style={styles.label}>CNPJ</Text>
      <TextInput style={styles.input} value={cnpj} onChangeText={t => setCnpj(formatCNPJ(t))} placeholder="00.000.000/0000-00" placeholderTextColor="#999" keyboardType="numeric" maxLength={18} />

      <Text style={styles.label}>Nome do Representante</Text>
      <TextInput style={styles.input} value={nomeRepresentante} onChangeText={setNomeRepresentante} placeholder="Nome do representante" placeholderTextColor="#999" />

      <Text style={styles.label}>WhatsApp do Representante</Text>
      <TextInput style={styles.input} value={whatsappRepresentante} onChangeText={setWhatsappRepresentante} placeholder="(00) 00000-0000" placeholderTextColor="#999" keyboardType="phone-pad" />

      <Text style={styles.label}>Telefone</Text>
      <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} placeholder="(00) 00000-0000" placeholderTextColor="#999" keyboardType="phone-pad" />

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="email@exemplo.com" placeholderTextColor="#999" keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Tipo de Serviço</Text>
      <TextInput style={styles.input} value={tipoServico} onChangeText={setTipoServico} placeholder="Ex: Elétrica, Hidráulica..." placeholderTextColor="#999" />

      <Text style={styles.label}>Detalhes do Serviço</Text>
      <TextInput style={[styles.input, styles.textArea]} value={detalhesServico} onChangeText={setDetalhesServico} placeholder="Descreva o que é feito neste fornecedor..." placeholderTextColor="#999" multiline numberOfLines={4} textAlignVertical="top" />

      <Text style={styles.label}>Formas de Pagamento</Text>
      <TextInput style={styles.input} value={formasPagamento} onChangeText={setFormasPagamento} placeholder="Ex: Boleto, Cartão, Pix..." placeholderTextColor="#999" />

      <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveBtnText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {Platform.OS !== 'web' ? <TouchableWithoutFeedback onPress={Keyboard.dismiss}>{formContent}</TouchableWithoutFeedback> : formContent}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  saveBtn: {
    backgroundColor: '#1c1c1c',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default FornecedorFormScreen;
