import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, RefreshControl, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { useFocusEffect, useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { maquinasApi } from '../../api/maquinas';
import { ordensApi } from '../../api/ordensServico';
import { Maquina, OrdemServico } from '../../types';
import { MaquinasStackParamList } from '../../navigation/MainTabNavigator';
import StatusBadge from '../../components/StatusBadge';
import { FILES_BASE_URL } from '../../config';

type DetailRoute = RouteProp<MaquinasStackParamList, 'MaquinaDetail'>;

const MaquinaDetailScreen: React.FC = () => {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation();
  const [maquina, setMaquina] = useState<Maquina | null>(null);
  const [ordensRecentes, setOrdensRecentes] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await maquinasApi.buscarPorId(route.params.id);
      setMaquina(data);
      try {
        const page = await ordensApi.buscarPorMaquina(route.params.id, 0, 5);
        setOrdensRecentes(page.content);
        setCurrentPage(0);
        setTotalPages(page.totalPages);
      } catch (_) {}
    } catch (error) { console.error(error); }
    finally { setLoading(false) }
  }, [route.params.id]);

  const loadMore = useCallback(async () => {
    if (loadingMore || currentPage + 1 >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const page = await ordensApi.buscarPorMaquina(route.params.id, nextPage, 5);
      setOrdensRecentes(prev => [...prev, ...page.content]);
      setCurrentPage(nextPage);
    } catch (_) {}
    finally { setLoadingMore(false) }
  }, [loadingMore, currentPage, totalPages, route.params.id]);

  useFocusEffect(useCallback(() => { load() }, [load]));

  if (loading) return <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#1c1c1c" />;
  if (!maquina) return <Text style={{ textAlign: 'center', marginTop: 60 }}>Máquina não encontrada</Text>;

  const capa = maquina.anexos?.find(a => a.categoria?.toLowerCase() === 'capa');
  const outrosAnexos = maquina.anexos?.filter(a => a.categoria?.toLowerCase() !== 'capa') ?? [];

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString() : '';

  const Field = ({ label, value }: { label: string; value?: string | null }) =>
    value ? <Text style={styles.field}><Text style={styles.fieldLabel}>{label}: </Text>{value}</Text> : null;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}>
      <View style={styles.infoCard}>
        <View style={styles.infoLeft}>
          <Text style={styles.titulo}>{maquina.nome}</Text>
          <Text style={styles.codigo}>Código: {maquina.codigoMaquina}</Text>
          <View style={{ marginVertical: 6 }}><StatusBadge status={maquina.status} /></View>
        </View>
        {capa && (
          <TouchableOpacity onPress={() => Linking.openURL(FILES_BASE_URL + capa.url)}>
            <Image source={{ uri: FILES_BASE_URL + capa.url }} style={styles.capa} resizeMode="cover" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classificação</Text>
        <Field label="APR" value={maquina.apr} />
        <Field label="NR-12" value={maquina.nr12} />
        <Field label="Fonte Energia" value={maquina.fonteEnergia} />
        <Field label="Operador" value={maquina.nomeOperador} />
        <Field label="Setor" value={maquina.setor} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fabricante</Text>
        <Field label="Nº Série" value={maquina.numeroSerie} />
        <Field label="Fabricante" value={maquina.fabricante} />
        <Field label="Modelo" value={maquina.modelo} />
        <Field label="CNPJ Fabricante" value={maquina.cnpjFabricante} />
        <Field label="Ano Fabricação" value={maquina.anoFabricacao} />
        <Field label="Peso" value={maquina.peso} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datas</Text>
        <Field label="Data Compra" value={formatDate(maquina.dataCompra)} />
        <Field label="Garantia" value={formatDate(maquina.dataGarantia)} />
      </View>

      {maquina.observacoes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.value}>{maquina.observacoes}</Text>
        </View>
      ) : null}

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.actionBtnHalf} onPress={() => navigation.navigate('OrdensTab' as never, { screen: 'OSForm', params: { maquinaId: maquina.id, fromMaquinaId: maquina.id } } as never)}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Abrir OS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtnHalf} onPress={() => navigation.navigate('MaquinaForm', { id: maquina.id })}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.actionBtnText}>Editar Máquina</Text>
        </TouchableOpacity>
      </View>

      {maquina.pastas && maquina.pastas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pastas</Text>
          {maquina.pastas.map(pasta => {
            const anexosPasta = maquina.anexos?.filter(a => a.pastaId === pasta.id) ?? [];
            return (
              <TouchableOpacity key={pasta.id} style={styles.pastaItem}>
                <Ionicons name="folder-outline" size={18} color="#f39c12" />
                <Text style={styles.pastaNome}>{pasta.nome}</Text>
                <Text style={styles.pastaCount}>{anexosPasta.length} anexos</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Anexos ({outrosAnexos.length})</Text>
        {outrosAnexos.length > 0 ? (
          <View style={styles.anexosGrid}>
            {outrosAnexos.map(a => {
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
        ) : (
          <Text style={{ color: '#999', fontStyle: 'italic' }}>Nenhum anexo</Text>
        )}
      </View>

      {maquina.fornecedores && maquina.fornecedores.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fornecedores Associados</Text>
          {maquina.fornecedores.map((f, idx) => (
            <View key={idx} style={styles.fornecedorItem}>
              <Ionicons name="business-outline" size={16} color="#555" />
              <Text style={styles.fornecedorNome}>{f.nome}</Text>
              {(f as any).observacao ? <Text style={styles.fornecedorObs}>{(f as any).observacao}</Text> : null}
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ordens de Serviço Recentes</Text>
        {ordensRecentes.length > 0 ? ordensRecentes.map(os => (
          <TouchableOpacity key={os.id} style={styles.osItem} onPress={() => navigation.navigate('OrdensTab' as never, { screen: 'OSDetail', params: { id: os.id, fromMaquinaId: maquina.id } } as never)}>
            <Text style={styles.osNumero}>{os.numeroOS}</Text>
            <StatusBadge status={os.status} />
          </TouchableOpacity>
        )) : <Text style={{ color: '#999' }}>Nenhuma OS encontrada</Text>}
        {currentPage + 1 < totalPages && (
          <TouchableOpacity style={styles.loadMoreBtn} onPress={loadMore} disabled={loadingMore}>
            {loadingMore ? (
              <ActivityIndicator size="small" color="#1c1c1c" />
            ) : (
              <Text style={styles.loadMoreText}>Carregar mais</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default MaquinaDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  infoCard: { flexDirection: 'row', backgroundColor: '#fff', margin: 16, marginBottom: 0, padding: 14, borderRadius: 10, elevation: 1 },
  infoLeft: { flex: 1, paddingRight: 12 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#1c1c1c', marginBottom: 6 },
  codigo: { fontSize: 14, color: '#555', marginBottom: 4, fontWeight: '500' },
  field: { fontSize: 13, color: '#555', marginBottom: 2, lineHeight: 20 },
  fieldLabel: { fontWeight: '600', color: '#333' },
  value: { fontSize: 14, color: '#444', marginBottom: 4 },
  capa: { width: 170, height: 170, borderRadius: 8 },
  actionBtn: { flexDirection: 'row', backgroundColor: '#1c1c1c', marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionBtnHalf: { flex: 1, flexDirection: 'row', backgroundColor: '#1c1c1c', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 6 },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  section: { backgroundColor: '#fff', margin: 16, marginBottom: 0, padding: 14, borderRadius: 10, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1c1c1c', marginBottom: 8 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontSize: 15, color: '#1c1c1c', fontWeight: '500' },
  pastaItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', gap: 8 },
  pastaNome: { fontSize: 14, color: '#333', flex: 1, fontWeight: '500' },
  pastaCount: { fontSize: 12, color: '#999' },
  anexosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  anexoCard: { width: 100, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  anexoThumb: { width: 100, height: 80, resizeMode: 'cover' },
  anexoFileIcon: { width: 100, height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  anexoName: { fontSize: 10, color: '#555', textAlign: 'center', paddingHorizontal: 4, paddingTop: 2 },
  fornecedorItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8, flexWrap: 'wrap' },
  fornecedorNome: { fontSize: 14, color: '#333', fontWeight: '500' },
  fornecedorObs: { fontSize: 12, color: '#999', width: '100%', marginLeft: 24 },
  osItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  osNumero: { fontSize: 14, color: '#333', fontWeight: '500' },
  loadMoreBtn: { marginTop: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 6 },
  loadMoreText: { fontSize: 14, color: '#1c1c1c', fontWeight: '600' },
});