import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  status: string;
}

const colors: Record<string, string> = {
  ATIVA: '#2e7d32',
  EM_MANUTENCAO: '#ed6c02',
  PARADA: '#d32f2f',
  DESATIVADA: '#9e9e9e',
  ABERTA: '#333333',
  EM_ANDAMENTO: '#f57c00',
  AGUARDANDO_PECA: '#6a1b9a',
  CONCLUIDA: '#2e7d32',
  CANCELADA: '#9e9e9e',
  BAIXA: '#2e7d32',
  MEDIA: '#f57c00',
  ALTA: '#d32f2f',
  URGENTE: '#b71c1c',
  PREVENTIVA: '#333333',
  CORRETIVA: '#e65100',
  EMERGENCIAL: '#b71c1c',
  INSTALACAO: '#2e7d32',
};

const labels: Record<string, string> = {
  ATIVA: 'Ativa',
  EM_MANUTENCAO: 'Em Manutenção',
  PARADA: 'Parada',
  DESATIVADA: 'Desativada',
  ABERTA: 'Aberta',
  EM_ANDAMENTO: 'Em Andamento',
  AGUARDANDO_PECA: 'Aguard. Peça',
  AGUARDANDO_APROVACAO: 'Aguard. Aprov.',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
};

const StatusBadge: React.FC<Props> = ({ status }) => (
  <View style={[styles.badge, { backgroundColor: colors[status] || '#9e9e9e' }]}>
    <Text style={styles.text}>{labels[status] || status}</Text>
  </View>
);

export default StatusBadge;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
