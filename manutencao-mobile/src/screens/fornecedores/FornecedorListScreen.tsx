import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fornecedoresApi } from '../../api/fornecedores';
import { Fornecedor } from '../../types';

const FornecedorListScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = search.trim()
        ? await fornecedoresApi.search(search.trim())
        : await fornecedoresApi.listar();
      setFornecedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, [search]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const doDelete = async (id: string) => {
    try {
      await fornecedoresApi.deletar(id);
      await load();
    } catch (error: any) {
      Alert.alert('Erro', error?.response?.data?.error || 'Não foi possível excluir o fornecedor');
    }
  };

  const handleDelete = (item: Fornecedor) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir fornecedor "${item.nome}"?`)) {
        doDelete(item.id);
      }
    } else {
      Alert.alert('Excluir', `Excluir fornecedor "${item.nome}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => doDelete(item.id) },
      ]);
    }
  };

  const renderItem = ({ item }: { item: Fornecedor }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={() => navigation.navigate('FornecedorForm', { id: item.id })}
      >
        <View style={styles.cardContent}>
          <Text style={styles.nome}>{item.nome}</Text>
          {item.cnpj ? <Text style={styles.info}>CNPJ: {item.cnpj}</Text> : null}
          {item.nomeRepresentante ? <Text style={styles.info}>Contato: {item.nomeRepresentante}</Text> : null}
          {item.telefone ? <Text style={styles.info}>Tel: {item.telefone}</Text> : null}
          {item.whatsappRepresentante ? <Text style={styles.info}>WhatsApp: {item.whatsappRepresentante}</Text> : null}
          {item.tipoServico ? <Text style={styles.tipoServico}>{item.tipoServico}</Text> : null}
          {item.detalhesServico ? <Text style={styles.info} numberOfLines={2}>{item.detalhesServico}</Text> : null}
          {item.formasPagamento ? <Text style={styles.info}>Pagamento: {item.formasPagamento}</Text> : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
        <Ionicons name="trash-outline" size={20} color="#c0392b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Buscar fornecedor..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={fornecedores}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        {...({ refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> } as any)}
        contentContainerStyle={fornecedores.length === 0 ? { flex: 1, justifyContent: 'center', alignItems: 'center' } : undefined}
        ListEmptyComponent={<Text style={{ color: '#999', fontSize: 15 }}>Nenhum fornecedor encontrado</Text>}
      />
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('FornecedorForm', {})}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  search: {
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardTouchable: { flex: 1 },
  cardContent: { flex: 1 },
  nome: { fontSize: 16, fontWeight: '600', color: '#1c1c1c', marginBottom: 4 },
  info: { fontSize: 13, color: '#666', marginTop: 2 },
  tipoServico: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#3498db',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  deleteBtn: { padding: 8 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1c1c1c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
});

export default FornecedorListScreen;
