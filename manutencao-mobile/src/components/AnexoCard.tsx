import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Anexo {
  id: string;
  url: string;
  nomeOriginal?: string;
  tipo?: string;
  categoria?: string;
  pastaId?: string;
  pastaNome?: string;
}

interface Props {
  a: Anexo;
  isImage: boolean;
  onDownload: () => void;
  onStar?: () => void;
  onMove: () => void;
  onRemove: () => void;
}

const AnexoCard: React.FC<Props> = ({ a, isImage, onDownload, onStar, onMove, onRemove }) => (
  <View style={styles.card}>
    {isImage ? (
      <Image source={{ uri: a.url }} style={styles.thumb} />
    ) : (
      <View style={styles.fileIcon}>
        <Ionicons name="document-outline" size={28} color="#999" />
      </View>
    )}
    {a.nomeOriginal && <Text style={styles.name} numberOfLines={2}>{a.nomeOriginal}</Text>}
    <View style={styles.actions}>
      <TouchableOpacity style={styles.btn} onPress={onDownload}>
        <Ionicons name="download-outline" size={14} color="#555" />
      </TouchableOpacity>
      {onStar && (
        <TouchableOpacity style={[styles.btn, a.categoria === 'capa' && styles.btnActive]} onPress={onStar}>
          <Ionicons name={a.categoria === 'capa' ? 'star' : 'star-outline'} size={14} color={a.categoria === 'capa' ? '#fff' : '#555'} />
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.btn} onPress={onMove}>
        <Ionicons name="folder-outline" size={14} color="#555" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={onRemove}>
        <Ionicons name="trash-outline" size={14} color="#d32f2f" />
      </TouchableOpacity>
    </View>
  </View>
);

export default AnexoCard;

const styles = StyleSheet.create({
  card: { width: 100, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  thumb: { width: 100, height: 80, resizeMode: 'cover' },
  fileIcon: { width: 100, height: 80, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  name: { fontSize: 10, color: '#555', textAlign: 'center', paddingHorizontal: 4, paddingTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', padding: 4 },
  btn: { padding: 4, borderRadius: 4 },
  btnActive: { backgroundColor: '#1c1c1c' },
});
