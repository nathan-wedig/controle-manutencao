import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Dimensions, Modal, FlatList, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from '../../api/client';
import { maquinasApi } from '../../api/maquinas';
import { Maquina } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { AdminStackParamList } from '../../navigation/MainTabNavigator';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type ReportNav = NativeStackNavigationProp<AdminStackParamList, 'Relatorios'>;

interface MesResumo {
  mes: string; ano: number; quantidadeOS: number; custoTotal: number;
}

interface MaquinaResumo {
  maquinaId: string; maquinaNome: string; maquinaCodigo: string;
  quantidadeOS: number; custoTotal: number;
}

interface SetorResumo {
  setor: string; quantidadeOS: number; custoTotal: number;
}

interface DashboardData {
  custoTotalPeriodo: number; totalOSPeriodo: number; custoMedioOS: number;
  meses: MesResumo[];
  topMaquinasOS: MaquinaResumo[]; topMaquinasCusto: MaquinaResumo[];
  topSetoresOS: SetorResumo[]; topSetoresCusto: SetorResumo[];
}

interface OSItem {
  id: string; numeroOS: string; tipo: string; status: string;
  setor: string; dataAbertura: string; custoTotal: number;
  maquinaNome?: string; maquinaCodigo?: string;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dec'];
const SCREEN_W = Dimensions.get('window').width;

const BarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; valueSuffix?: string; height?: number }> = ({ data, valueSuffix = '', height = 150 }) => {
  if (!data.length) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barW = Math.max(20, Math.min(50, (SCREEN_W - 80) / data.length - 6));
  return (
    <View style={chartStyles.wrapper}>
      <View style={[chartStyles.container, { minHeight: height + 60 }]}>
        {data.map((item, i) => {
          const h = maxVal > 0 ? (item.value / maxVal) * height : 0;
          return (
            <View key={i} style={chartStyles.col}>
              <Text style={chartStyles.value}>{item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value.toFixed(0)}{valueSuffix}</Text>
              <View style={[chartStyles.bar, { height: Math.max(h, 4), width: barW, backgroundColor: item.color || '#1c1c1c' }]} />
              <Text style={chartStyles.label}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const chartStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  container: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, elevation: 2 },
  col: { alignItems: 'center', marginHorizontal: 2 },
  bar: { borderRadius: 4, minWidth: 18 },
  value: { fontSize: 9, color: '#333', marginBottom: 3, fontWeight: '600' },
  label: { fontSize: 10, color: '#666', marginTop: 4, fontWeight: '500' },
});

const statusOptions = ['TODOS', 'ATIVA', 'EM_MANUTENCAO', 'PARADA', 'DESATIVADA'];

const COLUMNS: { key: string; label: string; width: number }[] = [
  { key: 'codigoMaquina', label: 'Nº Patrimônio', width: 100 },
  { key: 'apr', label: 'APR', width: 60 },
  { key: 'nr12', label: 'NR 12', width: 60 },
  { key: 'nome', label: 'Descrição Máquina/Equipamento', width: 180 },
  { key: 'setor', label: 'Setor', width: 100 },
  { key: 'numeroSerie', label: 'Nº Série', width: 90 },
  { key: 'fabricante', label: 'Fabricante', width: 120 },
  { key: 'anoFabricacao', label: 'Ano Fab.', width: 70 },
  { key: 'cnpjFabricante', label: 'CNPJ Fab.', width: 130 },
  { key: 'modelo', label: 'Modelo', width: 100 },
  { key: 'peso', label: 'Peso', width: 60 },
  { key: 'dataCompra', label: 'Data Compra', width: 90 },
  { key: 'dataGarantia', label: 'Garantia', width: 80 },
  { key: 'status', label: 'Status', width: 100 },
  { key: 'nomeOperador', label: 'Nome Operador', width: 120 },
];

const RelatorioScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<ReportNav>();

  if (user?.role === 'USER') {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed-outline" size={64} color="#d32f2f" />
        <Text style={styles.deniedText}>Acesso restrito</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Relatórios</Text>
      <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('RelatorioCusto')}>
        <Ionicons name="cash-outline" size={32} color="#fff" />
        <Text style={styles.menuBtnText}>Relatório de Custos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('RelatorioMaquinas')}>
        <Ionicons name="hardware-chip-outline" size={32} color="#fff" />
        <Text style={styles.menuBtnText}>Relatório Máquinas</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('RelatorioMaquinasOS')}>
        <Ionicons name="document-text-outline" size={32} color="#fff" />
        <Text style={styles.menuBtnText}>Relatório OS por Máquina</Text>
      </TouchableOpacity>
    </View>
  );
};

export const CustoRelatorio: React.FC = () => {
  const navigation = useNavigation<ReportNav>();
  const now = new Date();
  const [mesInicio, setMesInicio] = useState(now.getMonth() + 1);
  const [anoInicio, setAnoInicio] = useState(now.getFullYear());
  const [mesFim, setMesFim] = useState(now.getMonth() + 1);
  const [anoFim, setAnoFim] = useState(now.getFullYear());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [drillTitle, setDrillTitle] = useState('');
  const [drillOS, setDrillOS] = useState<OSItem[]>([]);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillVisible, setDrillVisible] = useState(false);

  const formatDate = (ano: number, mes: number) => `${ano}-${String(mes).padStart(2, '0')}-01`;

  const fetch = async () => {
    const ultimoDia = new Date(anoFim, mesFim, 0).getDate();
    const fim = `${anoFim}-${String(mesFim).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    setLoading(true);
    try {
      const r = await api.get(`/api/relatorios/dashboard?inicio=${formatDate(anoInicio, mesInicio)}&fim=${fim}`);
      setData(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openDrill = async (title: string, url: string) => {
    const ultimoDia = new Date(anoFim, mesFim, 0).getDate();
    const fim = `${anoFim}-${String(mesFim).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    setDrillTitle(title);
    setDrillVisible(true);
    setDrillLoading(true);
    try {
      const r = await api.get(`${url}&inicio=${formatDate(anoInicio, mesInicio)}&fim=${fim}`);
      setDrillOS(r.data);
    } catch (e) { setDrillOS([]); }
    finally { setDrillLoading(false); }
  };

  const periodInicio = () => { if (anoInicio === anoFim && mesInicio > mesFim) setMesFim(mesInicio); };
  const periodFim = () => { if (anoFim === anoInicio && mesFim < mesInicio) setMesInicio(mesFim); };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={styles.container}>
        <View style={styles.voltarRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltarBtn}>
            <Ionicons name="arrow-back-outline" size={20} color="#1c1c1c" />
            <Text style={styles.voltarText}>Voltar</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Relatório de Custos</Text>
        <View style={styles.periodRow}>
          <View style={styles.periodCol}>
            <Text style={styles.periodLabel}>De</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity onPress={() => { setMesInicio(m => Math.max(1, m - 1)); periodInicio(); }}><Ionicons name="chevron-back-outline" size={20} color="#1c1c1c" /></TouchableOpacity>
              <Text style={styles.pickerText}>{MONTHS[mesInicio - 1]}</Text>
              <TouchableOpacity onPress={() => { setMesInicio(m => Math.min(12, m + 1)); periodInicio(); }}><Ionicons name="chevron-forward-outline" size={20} color="#1c1c1c" /></TouchableOpacity>
            </View>
            <View style={styles.anoRow}>
              <TouchableOpacity onPress={() => setAnoInicio(a => a - 1)}><Ionicons name="chevron-back-outline" size={18} color="#1c1c1c" /></TouchableOpacity>
              <Text style={styles.anoText}>{anoInicio}</Text>
              <TouchableOpacity onPress={() => setAnoInicio(a => a + 1)}><Ionicons name="chevron-forward-outline" size={18} color="#1c1c1c" /></TouchableOpacity>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#999" style={{ marginTop: 20 }} />
          <View style={styles.periodCol}>
            <Text style={styles.periodLabel}>Até</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity onPress={() => { setMesFim(m => Math.max(1, m - 1)); periodFim(); }}><Ionicons name="chevron-back-outline" size={20} color="#1c1c1c" /></TouchableOpacity>
              <Text style={styles.pickerText}>{MONTHS[mesFim - 1]}</Text>
              <TouchableOpacity onPress={() => { setMesFim(m => Math.min(12, m + 1)); periodFim(); }}><Ionicons name="chevron-forward-outline" size={20} color="#1c1c1c" /></TouchableOpacity>
            </View>
            <View style={styles.anoRow}>
              <TouchableOpacity onPress={() => setAnoFim(a => a - 1)}><Ionicons name="chevron-back-outline" size={18} color="#1c1c1c" /></TouchableOpacity>
              <Text style={styles.anoText}>{anoFim}</Text>
              <TouchableOpacity onPress={() => setAnoFim(a => a + 1)}><Ionicons name="chevron-forward-outline" size={18} color="#1c1c1c" /></TouchableOpacity>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.fetchBtn} onPress={fetch}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.fetchText}>Gerar Relatório</Text>}
        </TouchableOpacity>
        {data && (
          <>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { flex: 1 }]}>
                <Text style={styles.summaryLabel}>Total Gasto</Text>
                <Text style={styles.summaryValue}>R$ {data.custoTotalPeriodo.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryCard, { flex: 1 }]}>
                <Text style={styles.summaryLabel}>Total OS</Text>
                <Text style={styles.summaryValue}>{data.totalOSPeriodo}</Text>
              </View>
              <View style={[styles.summaryCard, { flex: 1 }]}>
                <Text style={styles.summaryLabel}>Custo Médio</Text>
                <Text style={styles.summaryValue}>R$ {data.custoMedioOS.toFixed(2)}</Text>
              </View>
            </View>
            {data.meses.length > 0 && (
              <>
                <Text style={styles.subTitle}>Custo Mensal</Text>
                <BarChart data={data.meses.map(m => ({ label: MONTHS[parseInt(m.mes) - 1], value: m.custoTotal }))} valueSuffix="" height={120} />
                <Text style={styles.subTitle}>OS por Mês</Text>
                <BarChart data={data.meses.map(m => ({ label: MONTHS[parseInt(m.mes) - 1], value: m.quantidadeOS, color: '#f57c00' }))} valueSuffix="" height={120} />
              </>
            )}
            {data.topMaquinasOS.length > 0 && (
              <>
                <Text style={styles.subTitle}>Top Máquinas</Text>
                <View style={styles.topRow}>
                  <View style={styles.topCol}>
                    <Text style={styles.topColTitle}>Mais OS</Text>
                    {data.topMaquinasOS.slice(0, 5).map((m, i) => (
                      <TouchableOpacity key={m.maquinaId} style={styles.topItem} onPress={() => openDrill(`${m.maquinaCodigo} - ${m.maquinaNome}`, `/api/relatorios/periodo/maquina/${m.maquinaId}?`)}>
                        <Text style={styles.topRank}>{i + 1}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.topName} numberOfLines={1}>{m.maquinaCodigo} - {m.maquinaNome}</Text>
                          <Text style={styles.topInfo}>{m.quantidadeOS} OS • R$ {m.custoTotal.toFixed(2)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.topCol}>
                    <Text style={styles.topColTitle}>Mais Custo</Text>
                    {data.topMaquinasCusto.slice(0, 5).map((m, i) => (
                      <TouchableOpacity key={m.maquinaId} style={styles.topItem} onPress={() => openDrill(`${m.maquinaCodigo} - ${m.maquinaNome}`, `/api/relatorios/periodo/maquina/${m.maquinaId}?`)}>
                        <Text style={styles.topRank}>{i + 1}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.topName} numberOfLines={1}>{m.maquinaCodigo} - {m.maquinaNome}</Text>
                          <Text style={styles.topInfo}>R$ {m.custoTotal.toFixed(2)} • {m.quantidadeOS} OS</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
            {data.topSetoresOS.length > 0 && (
              <>
                <Text style={styles.subTitle}>Top Setores</Text>
                <View style={styles.topRow}>
                  <View style={styles.topCol}>
                    <Text style={styles.topColTitle}>Mais OS</Text>
                    {data.topSetoresOS.slice(0, 5).map((s, i) => (
                      <TouchableOpacity key={s.setor} style={styles.topItem} onPress={() => openDrill(s.setor, `/api/relatorios/periodo/setor?setor=${encodeURIComponent(s.setor)}&`)}>
                        <Text style={styles.topRank}>{i + 1}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.topName} numberOfLines={1}>{s.setor}</Text>
                          <Text style={styles.topInfo}>{s.quantidadeOS} OS • R$ {s.custoTotal.toFixed(2)}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.topCol}>
                    <Text style={styles.topColTitle}>Mais Custo</Text>
                    {data.topSetoresCusto.slice(0, 5).map((s, i) => (
                      <TouchableOpacity key={s.setor} style={styles.topItem} onPress={() => openDrill(s.setor, `/api/relatorios/periodo/setor?setor=${encodeURIComponent(s.setor)}&`)}>
                        <Text style={styles.topRank}>{i + 1}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.topName} numberOfLines={1}>{s.setor}</Text>
                          <Text style={styles.topInfo}>R$ {s.custoTotal.toFixed(2)} • {s.quantidadeOS} OS</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
            <View style={{ height: 40 }} />
          </>
        )}
      </ScrollView>
      <Modal visible={drillVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{drillTitle}</Text>
              <TouchableOpacity onPress={() => setDrillVisible(false)}><Ionicons name="close" size={24} color="#333" /></TouchableOpacity>
            </View>
            {drillLoading ? (
              <ActivityIndicator size="large" color="#1c1c1c" style={{ marginTop: 40 }} />
            ) : drillOS.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma OS encontrada no período</Text>
            ) : (
              <View style={{ maxHeight: 400 }}>
                <FlatList data={drillOS} keyExtractor={(i: OSItem) => i.id}
                  renderItem={({ item }: { item: OSItem }) => (
                    <View style={styles.drillItem}>
                      <View style={styles.drillItemHeader}>
                        <Text style={styles.drillNumero}>{item.numeroOS}</Text>
                        <Text style={[styles.drillStatus, { color: item.status === 'CONCLUIDA' ? '#2e7d32' : item.status === 'CANCELADA' ? '#d32f2f' : '#f57c00' }]}>{item.status}</Text>
                      </View>
                      <Text style={styles.drillInfo}>{item.tipo} • {item.dataAbertura?.split('T')[0]?.split('-').reverse().join('/')}</Text>
                      {item.setor ? <Text style={styles.drillInfo}>Setor: {item.setor}</Text> : null}
                      <Text style={styles.drillCost}>Custo: R$ {item.custoTotal?.toFixed(2) || '0,00'}</Text>
                    </View>
                  )}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export const MaquinaRelatorio: React.FC = () => {
  const navigation = useNavigation<ReportNav>();
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [setores, setSetores] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [columnFilters, setColumnFilters] = useState<Record<string, Set<string>>>({});
  const [filterColumn, setFilterColumn] = useState<string | null>(null);

  const fetchMaquinas = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (filtroSetor) params.setor = filtroSetor;
      if (filtroStatus && filtroStatus !== 'TODOS') params.status = filtroStatus;
      const data = await maquinasApi.relatorio(params);
      setMaquinas(data);
      const uniqueSetores = [...new Set(data.map(m => m.setor).filter(Boolean))] as string[];
      setSetores(uniqueSetores);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatDate = (d?: string) => d ? d.split('-').reverse().join('/') : '';

  const getCellValue = (m: Maquina, col: typeof COLUMNS[0]): string => {
    const val = (m as any)[col.key];
    if (col.key === 'dataCompra' || col.key === 'dataGarantia') return formatDate(val);
    if (col.key === 'status') return (val || '').replace('_', ' ');
    return String(val ?? '');
  };

  const getUniqueValues = (key: string): string[] => {
    const values = new Set(maquinas.map(m => {
      const col = COLUMNS.find(c => c.key === key);
      return col ? getCellValue(m, col) : '';
    }));
    return Array.from(values).filter(Boolean).sort();
  };

  const filteredMaquinas = maquinas.filter(m => {
    return Object.entries(columnFilters).every(([key, selected]) => {
      if (!selected || selected.size === 0) return true;
      const col = COLUMNS.find(c => c.key === key);
      const val = col ? getCellValue(m, col) : '';
      return selected.has(val);
    });
  });

  const generateHTML = () => {
    let rows = filteredMaquinas.map(m => `
      <tr>${COLUMNS.map(col => `<td>${getCellValue(m, col)}</td>`).join('')}</tr>
    `).join('');

    return `
      <html>
      <head><meta charset="utf-8"><title>Relatório Máquinas</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        th { background-color: #1c1c1c; color: #fff; }
        tr:nth-child(even) { background-color: #f5f5f5; }
      </style></head>
      <body>
        <h1>Relatório de Máquinas - Gestão de Manutenção Industrial</h1>
        <table>
          <thead><tr>${COLUMNS.map(col => `<th>${col.label}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="text-align:right;color:#999;margin-top:10px">Gerado em ${new Date().toLocaleDateString()}</p>
      </body></html>
    `;
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const html = generateHTML();
      if (Platform.OS === 'web') {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(html);
          win.document.close();
          win.print();
        }
      } else {
        const path = FileSystem.cacheDirectory + 'relatorio_maquinas.html';
        await FileSystem.writeAsStringAsync(path, html);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(path);
        }
      }
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const header = COLUMNS.map(c => `"${c.label}"`).join(';');
      const rows = filteredMaquinas.map(m =>
        COLUMNS.map(c => `"${getCellValue(m, c).replace(/"/g, '""')}"`).join(';')
      ).join('\n');
      const csv = `\uFEFF${header}\n${rows}\n`;
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'relatorio_maquinas.csv';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const path = FileSystem.cacheDirectory + 'relatorio_maquinas.csv';
        await FileSystem.writeAsStringAsync(path, csv);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(path);
        }
      }
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.voltarRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltarBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#1c1c1c" />
          <Text style={styles.voltarText}>Voltar</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.pdfBtn} onPress={exportCSV} disabled={exporting || maquinas.length === 0}>
            {exporting ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="grid-outline" size={18} color="#fff" />}
            <Text style={styles.pdfBtnText}>  {exporting ? 'Gerando...' : 'Excel'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pdfBtn} onPress={exportPDF} disabled={exporting || maquinas.length === 0}>
            {exporting ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="download-outline" size={18} color="#fff" />}
            <Text style={styles.pdfBtnText}>  {exporting ? 'Gerando...' : 'PDF'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.title}>Relatório Máquinas</Text>
      <Text style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: -8, marginBottom: 8 }}>Gestão de Manutenção Industrial</Text>
      <View style={styles.filterRow}>
        <TextInput style={styles.filterInput} placeholder="Buscar..." value={search} onChangeText={setSearch} autoCapitalize="none" autoCorrect={false} />
      </View>
      <View style={styles.filterRow}>
        {setores.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity style={[styles.filterChip, !filtroSetor && styles.filterChipAtivo]} onPress={() => setFiltroSetor('')}>
              <Text style={[styles.filterChipText, !filtroSetor && styles.filterChipTextAtivo]}>Todos</Text>
            </TouchableOpacity>
            {setores.map(s => (
              <TouchableOpacity key={s} style={[styles.filterChip, filtroSetor === s && styles.filterChipAtivo]} onPress={() => setFiltroSetor(filtroSetor === s ? '' : s)}>
                <Text style={[styles.filterChipText, filtroSetor === s && styles.filterChipTextAtivo]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {statusOptions.map(s => (
            <TouchableOpacity key={s} style={[styles.filterChip, filtroStatus === s && styles.filterChipAtivo]} onPress={() => setFiltroStatus(filtroStatus === s ? '' : s)}>
              <Text style={[styles.filterChipText, filtroStatus === s && styles.filterChipTextAtivo]}>{s === 'EM_MANUTENCAO' ? 'Em Manutenção' : s === 'TODOS' ? 'Todos Status' : s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.fetchBtn} onPress={fetchMaquinas}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.fetchText}>Gerar Relatório</Text>}
      </TouchableOpacity>
      {maquinas.length > 0 && (
        <Text style={styles.resultCount}>{filteredMaquinas.length} de {maquinas.length} máquina(s)</Text>
      )}
      <ScrollView style={{ flex: 1 }} horizontal>
        <View>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {COLUMNS.map(col => (
              <TouchableOpacity key={col.key} onPress={() => setFilterColumn(col.key)} style={[styles.tableCell, styles.tableHeaderCell, { width: col.width, flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, flex: 1 }} numberOfLines={1}>{col.label}</Text>
                <Ionicons name={columnFilters[col.key]?.size ? 'funnel' : 'funnel-outline'} size={11} color={columnFilters[col.key]?.size ? '#ffeb3b' : 'rgba(255,255,255,0.5)'} />
              </TouchableOpacity>
            ))}
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#1c1c1c" style={{ margin: 40 }} />
          ) : maquinas.length === 0 ? (
            <Text style={styles.emptyText}>Clique em "Gerar Relatório" para exibir os dados</Text>
          ) : (
            <ScrollView style={{ maxHeight: 500 }}>
              {filteredMaquinas.map(m => (
                <View key={m.id} style={styles.tableRow}>
                  {COLUMNS.map(col => (
                    <Text key={col.key} style={[styles.tableCell, { width: col.width }]}>{getCellValue(m, col)}</Text>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
      {filterColumn && (
        <Modal visible animationType="slide" transparent onRequestClose={() => setFilterColumn(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtrar {COLUMNS.find(c => c.key === filterColumn)?.label}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => {
                    setColumnFilters(prev => { const n = { ...prev }; delete n[filterColumn]; return n; });
                    setFilterColumn(null);
                  }}>
                    <Text style={{ color: '#1c1c1c', fontWeight: '600' }}>Limpar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setFilterColumn(null)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ maxHeight: 400, paddingBottom: 20 }}>
                {(() => {
                  const vals = getUniqueValues(filterColumn);
                  return (
                    <FlatList data={vals} keyExtractor={v => v}
                      renderItem={({ item }) => {
                        const selectedSet = columnFilters[filterColumn];
                        const checked = !selectedSet || selectedSet.size === 0 || selectedSet.has(item);
                        return (
                          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}
                            onPress={() => {
                              setColumnFilters(prev => {
                                const current = prev[filterColumn] ? new Set(prev[filterColumn]) : new Set(vals);
                                if (current.has(item)) current.delete(item); else current.add(item);
                                const next = { ...prev };
                                if (current.size === 0 || current.size === vals.length) delete next[filterColumn];
                                else next[filterColumn] = current;
                                return next;
                              });
                            }}>
                            <Ionicons name={checked ? 'checkbox-outline' : 'square-outline'} size={22} color="#1c1c1c" />
                            <Text style={{ marginLeft: 10, fontSize: 14, color: '#333' }}>{item || '(vazio)'}</Text>
                          </TouchableOpacity>
                        );
                      }}
                    />
                  );
                })()}
              </View>
              <TouchableOpacity style={{ backgroundColor: '#1c1c1c', padding: 12, borderRadius: 8, alignItems: 'center' }} onPress={() => setFilterColumn(null)}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      <View style={{ height: 40 }} />
    </View>
  );
};

export const MaquinaOSRelatorio: React.FC = () => {
  const navigation = useNavigation<ReportNav>();
  const [maquinas, setMaquinas] = useState<Maquina[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchMaq, setSearchMaq] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('');
  const [loadingMaq, setLoadingMaq] = useState(false);
  const [mesInicio, setMesInicio] = useState(new Date().getMonth() + 1);
  const [anoInicio, setAnoInicio] = useState(new Date().getFullYear());
  const [mesFim, setMesFim] = useState(new Date().getMonth() + 1);
  const [anoFim, setAnoFim] = useState(new Date().getFullYear());
  const [resultado, setResultado] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [generated, setGenerated] = useState(false);

  const formatDate = (ano: number, mes: number) => `${ano}-${String(mes).padStart(2, '0')}-01`;

  const fetchMaquinas = async () => {
    setLoadingMaq(true);
    try {
      const data = await maquinasApi.relatorio();
      setMaquinas(data);
    } catch (e) { console.error(e); }
    finally { setLoadingMaq(false); }
  };

  React.useEffect(() => { fetchMaquinas(); }, []);

  const toggleMaquina = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setGenerated(false);
    setResultado([]);
  };

  const toggleAll = () => {
    const filtered = maquinasFiltradas.map(m => m.id);
    if (filtered.every(id => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered));
    }
    setGenerated(false);
    setResultado([]);
  };

  const maquinasFiltradas = maquinas.filter(m => {
    if (filtroSetor && m.setor !== filtroSetor) return false;
    if (!searchMaq) return true;
    const s = searchMaq.toLowerCase();
    return m.codigoMaquina?.toLowerCase().includes(s) || m.nome?.toLowerCase().includes(s) || m.setor?.toLowerCase().includes(s);
  });

  const setores = [...new Set(maquinas.map(m => m.setor).filter(Boolean))] as string[];

  const allSelected = maquinasFiltradas.length > 0 && maquinasFiltradas.every(m => selectedIds.has(m.id));

  const periodInicio = () => { if (anoInicio === anoFim && mesInicio > mesFim) setMesFim(mesInicio); };
  const periodFim = () => { if (anoFim === anoInicio && mesFim < mesInicio) setMesInicio(mesFim); };

  const gerarRelatorio = async () => {
    if (selectedIds.size === 0) return;
    const ultimoDia = new Date(anoFim, mesFim, 0).getDate();
    const fim = `${anoFim}-${String(mesFim).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;
    setLoading(true);
    try {
      const r = await api.post('/api/relatorios/maquinas-os', {
        maquinaIds: Array.from(selectedIds),
        inicio: formatDate(anoInicio, mesInicio),
        fim,
      });
      setResultado(r.data);
      setGenerated(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatBR = (d?: string) => {
    if (!d) return '-';
    return d.split('T')[0].split('-').reverse().join('/');
  };

  const generateHTML = () => {
    const periodText = `${formatDate(anoInicio, mesInicio).split('-').reverse().join('/')} a ${anoFim}-${String(mesFim).padStart(2, '0')}-${String(new Date(anoFim, mesFim, 0).getDate()).padStart(2, '0')}`.split('-').reverse().join('/');
    let html = `<html><head><meta charset="utf-8"><title>Relatório OS por Máquina</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
      h1 { text-align: center; color: #333; font-size: 16px; }
      h2 { color: #1c1c1c; font-size: 14px; border-bottom: 2px solid #1c1c1c; padding-bottom: 4px; margin-top: 30px; }
      .maq-info { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 20px; background: #f5f5f5; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-size: 11px; }
      .maq-info span { color: #666; }
      .maq-info strong { color: #333; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th, td { border: 1px solid #ccc; padding: 5px 6px; text-align: left; font-size: 11px; }
      th { background-color: #1c1c1c; color: #fff; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      .status { font-weight: bold; }
      .status-CONCLUIDA { color: #2e7d32; }
      .status-ABERTA { color: #f57c00; }
      .status-CANCELADA { color: #d32f2f; }
      .footer { text-align: right; color: #999; margin-top: 20px; font-size: 10px; }
      .page-break { page-break-after: always; }
    </style></head><body>
    <h1>Relatório de Ordens de Serviço por Máquina</h1>
    <p style="text-align:center;color:#666;margin-bottom:20px">Gestão de Manutenção Industrial — Período: ${formatDate(anoInicio, mesInicio).split('-').reverse().join('/')} a ${String(new Date(anoFim, mesFim, 0).getDate()).padStart(2, '0')}/${String(mesFim).padStart(2, '0')}/${anoFim}</p>`;

    resultado.forEach((r, idx) => {
      const maq = maquinas.find(m => m.id === r.maquinaId);
      html += `
      <div class="page-break">
        <h2>${r.codigoMaquina || ''} — ${r.nome || ''}</h2>
        <div class="maq-info">
          <div><span>Código:</span> <strong>${r.codigoMaquina || '-'}</strong></div>
          <div><span>Nome:</span> <strong>${r.nome || '-'}</strong></div>
          <div><span>APR:</span> <strong>${r.apr || '-'}</strong></div>
          <div><span>NR 12:</span> <strong>${r.nr12 || '-'}</strong></div>
          <div><span>Setor:</span> <strong>${r.setor || '-'}</strong></div>
          <div><span>Fabricante:</span> <strong>${r.fabricante || '-'}</strong></div>
          <div><span>Modelo:</span> <strong>${r.modelo || '-'}</strong></div>
          <div><span>Nº Série:</span> <strong>${r.numeroSerie || '-'}</strong></div>
          <div><span>Ano Fab.:</span> <strong>${r.anoFabricacao || '-'}</strong></div>
          <div><span>Qtd OS no período:</span> <strong>${r.ordensServico?.length || 0}</strong></div>
        </div>`;

      if (r.ordensServico && r.ordensServico.length > 0) {
        html += `<table><thead><tr>
          <th>Nº OS</th><th>Data Abertura</th><th>Data Conclusão</th><th>Descrição</th><th>Ação Feita</th><th>Status</th><th>Técnico</th>
        </tr></thead><tbody>`;
        r.ordensServico.forEach((os: any) => {
          const statusClass = `status-${os.status || ''}`;
          html += `<tr>
            <td>${os.numeroOS || '-'}</td>
            <td>${formatBR(os.dataAbertura)}</td>
            <td>${formatBR(os.dataConclusao)}</td>
            <td>${os.problemaRelatado || '-'}</td>
            <td>${os.acaoFeita || '-'}</td>
            <td class="status ${statusClass}">${(os.status || '-').replace('_', ' ')}</td>
            <td>${os.tecnicoNome || '-'}</td>
          </tr>`;
        });
        html += `</tbody></table>`;
      } else {
        html += `<p style="color:#999;text-align:center;margin-top:20px">Nenhuma OS encontrada para esta máquina no período selecionado.</p>`;
      }
      html += `</div>`;
    });

    html += `<p class="footer">Gerado em ${new Date().toLocaleDateString('pt-BR')}</p></body></html>`;
    return html;
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const html = generateHTML();
      if (Platform.OS === 'web') {
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(html);
          win.document.close();
          win.print();
        }
      } else {
        const path = FileSystem.cacheDirectory + 'relatorio_os_maquinas.html';
        await FileSystem.writeAsStringAsync(path, html);
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(path);
        }
      }
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.voltarRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.voltarBtn}>
          <Ionicons name="arrow-back-outline" size={20} color="#1c1c1c" />
          <Text style={styles.voltarText}>Voltar</Text>
        </TouchableOpacity>
        {generated && resultado.length > 0 && (
          <TouchableOpacity style={styles.pdfBtn} onPress={exportPDF} disabled={exporting}>
            {exporting ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="download-outline" size={18} color="#fff" />}
            <Text style={styles.pdfBtnText}>  {exporting ? 'Gerando...' : 'PDF'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>Relatório OS por Máquina</Text>
      <Text style={{ fontSize: 12, color: '#888', textAlign: 'center', marginTop: -8, marginBottom: 8 }}>Selecione as máquinas e o período</Text>

      <View style={styles.filterRow}>
        <TextInput style={styles.filterInput} placeholder="Buscar máquina..." value={searchMaq} onChangeText={setSearchMaq} autoCapitalize="none" autoCorrect={false} />
      </View>

      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity style={[styles.filterChip, !filtroSetor && styles.filterChipAtivo]} onPress={() => setFiltroSetor('')}>
            <Text style={[styles.filterChipText, !filtroSetor && styles.filterChipTextAtivo]}>Todos</Text>
          </TouchableOpacity>
          {setores.map(s => (
            <TouchableOpacity key={s} style={[styles.filterChip, filtroSetor === s && styles.filterChipAtivo]} onPress={() => setFiltroSetor(filtroSetor === s ? '' : s)}>
              <Text style={[styles.filterChipText, filtroSetor === s && styles.filterChipTextAtivo]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
        <TouchableOpacity onPress={toggleAll} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name={allSelected ? 'checkbox-outline' : 'square-outline'} size={20} color="#1c1c1c" />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>Selecionar todas ({maquinasFiltradas.length})</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loadingMaq ? (
          <ActivityIndicator size="large" color="#1c1c1c" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={maquinasFiltradas}
            keyExtractor={m => m.id}
            renderItem={({ item: m }) => (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff', paddingHorizontal: 10, borderRadius: 6, marginBottom: 2 }}
                onPress={() => toggleMaquina(m.id)}
              >
                <Ionicons name={selectedIds.has(m.id) ? 'checkbox-outline' : 'square-outline'} size={22} color="#1c1c1c" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>{m.codigoMaquina} — {m.nome}</Text>
                  <Text style={{ fontSize: 11, color: '#888' }}>{m.setor}{m.fabricante ? ` • ${m.fabricante}` : ''}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <View style={styles.periodRow}>
        <View style={styles.periodCol}>
          <Text style={styles.periodLabel}>De</Text>
          <View style={styles.pickerRow}>
            <TouchableOpacity onPress={() => { setMesInicio(m => Math.max(1, m - 1)); periodInicio(); }}><Ionicons name="chevron-back-outline" size={20} color="#1c1c1c" /></TouchableOpacity>
            <Text style={styles.pickerText}>{MONTHS[mesInicio - 1]}</Text>
            <TouchableOpacity onPress={() => { setMesInicio(m => Math.min(12, m + 1)); periodInicio(); }}><Ionicons name="chevron-forward-outline" size={20} color="#1c1c1c" /></TouchableOpacity>
          </View>
          <View style={styles.anoRow}>
            <TouchableOpacity onPress={() => setAnoInicio(a => a - 1)}><Ionicons name="chevron-back-outline" size={18} color="#1c1c1c" /></TouchableOpacity>
            <Text style={styles.anoText}>{anoInicio}</Text>
            <TouchableOpacity onPress={() => setAnoInicio(a => a + 1)}><Ionicons name="chevron-forward-outline" size={18} color="#1c1c1c" /></TouchableOpacity>
          </View>
        </View>
        <Ionicons name="arrow-forward" size={24} color="#999" style={{ marginTop: 20 }} />
        <View style={styles.periodCol}>
          <Text style={styles.periodLabel}>Até</Text>
          <View style={styles.pickerRow}>
            <TouchableOpacity onPress={() => { setMesFim(m => Math.max(1, m - 1)); periodFim(); }}><Ionicons name="chevron-back-outline" size={20} color="#1c1c1c" /></TouchableOpacity>
            <Text style={styles.pickerText}>{MONTHS[mesFim - 1]}</Text>
            <TouchableOpacity onPress={() => { setMesFim(m => Math.min(12, m + 1)); periodFim(); }}><Ionicons name="chevron-forward-outline" size={20} color="#1c1c1c" /></TouchableOpacity>
          </View>
          <View style={styles.anoRow}>
            <TouchableOpacity onPress={() => setAnoFim(a => a - 1)}><Ionicons name="chevron-back-outline" size={18} color="#1c1c1c" /></TouchableOpacity>
            <Text style={styles.anoText}>{anoFim}</Text>
            <TouchableOpacity onPress={() => setAnoFim(a => a + 1)}><Ionicons name="chevron-forward-outline" size={18} color="#1c1c1c" /></TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.fetchBtn, selectedIds.size === 0 && { opacity: 0.5 }]}
        onPress={gerarRelatorio}
        disabled={loading || selectedIds.size === 0}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.fetchText}>Gerar Relatório ({selectedIds.size} máq.)</Text>}
      </TouchableOpacity>

      {generated && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {resultado.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma OS encontrada para as máquinas selecionadas no período</Text>
          ) : (
            resultado.map(r => (
              <View key={r.maquinaId} style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 8, elevation: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#333' }}>{r.codigoMaquina} — {r.nome}</Text>
                <Text style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{r.ordensServico?.length || 0} OS encontrada(s)</Text>
              </View>
            ))
          )}
        </View>
      )}
      <View style={{ height: 20 }} />
    </View>
  );
};

export default RelatorioScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  deniedText: { fontSize: 16, color: '#666', marginTop: 16, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333', padding: 16, paddingBottom: 8, textAlign: 'center' },
  menuBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1c1c1c', padding: 20, borderRadius: 12, marginVertical: 8, width: '100%', gap: 12 },
  menuBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  voltarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  voltarBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voltarText: { fontSize: 15, color: '#1c1c1c', fontWeight: '600' },
  pdfBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1c', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  pdfBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  periodRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  periodCol: { alignItems: 'center', flex: 1 },
  periodLabel: { fontSize: 13, fontWeight: '600', color: '#666', marginBottom: 4 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, elevation: 1 },
  pickerText: { fontSize: 15, fontWeight: '700', color: '#333', minWidth: 40, textAlign: 'center' },
  anoRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  anoText: { fontSize: 14, color: '#1c1c1c', fontWeight: '600', minWidth: 40, textAlign: 'center' },
  fetchBtn: { backgroundColor: '#1c1c1c', padding: 14, borderRadius: 8, marginHorizontal: 16, alignItems: 'center', marginTop: 16, marginBottom: 12 },
  fetchText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  summaryCard: { backgroundColor: '#fff', padding: 14, borderRadius: 10, elevation: 2 },
  summaryLabel: { fontSize: 11, color: '#999' },
  summaryValue: { fontSize: 17, fontWeight: 'bold', color: '#333', marginTop: 3 },
  subTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', paddingHorizontal: 16, marginBottom: 6, marginTop: 4 },
  topRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  topCol: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, elevation: 2 },
  topColTitle: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 6, textAlign: 'center' },
  topItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  topRank: { fontSize: 12, fontWeight: '700', color: '#999', width: 20, textAlign: 'center' },
  topName: { fontSize: 12, fontWeight: '600', color: '#333' },
  topInfo: { fontSize: 10, color: '#888', marginTop: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 12 },
  emptyText: { textAlign: 'center', color: '#999', padding: 30, fontSize: 14 },
  drillItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  drillItemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  drillNumero: { fontSize: 14, fontWeight: '700', color: '#1c1c1c' },
  drillStatus: { fontSize: 11, fontWeight: '600' },
  drillInfo: { fontSize: 12, color: '#888', marginTop: 1 },
  drillCost: { fontSize: 13, color: '#333', fontWeight: '600', marginTop: 2 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, alignItems: 'center' },
  filterInput: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 14 },
  filterScroll: { flexDirection: 'row' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#ccc', backgroundColor: '#fff', marginRight: 6 },
  filterChipAtivo: { backgroundColor: '#1c1c1c', borderColor: '#1c1c1c' },
  filterChipText: { fontSize: 12, color: '#666' },
  filterChipTextAtivo: { color: '#fff', fontWeight: '600' },
  resultCount: { fontSize: 13, color: '#666', paddingHorizontal: 16, marginBottom: 8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', backgroundColor: '#fff' },
  tableHeader: { backgroundColor: '#1c1c1c' },
  tableHeaderCell: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  tableCell: { padding: 8, fontSize: 12, color: '#333', borderRightWidth: 1, borderRightColor: '#f0f0f0' },
});
