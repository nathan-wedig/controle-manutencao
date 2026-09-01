import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { cacheDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface Props {
  value: string;
  label?: string;
}

const QRCodeView: React.FC<Props> = ({ value, label }) => {
  const qrRef = useRef<any>(null);

  const handleDownload = async () => {
    if (!qrRef.current) return;
    qrRef.current.toDataURL(async (dataUrl: string) => {
      const base64Data = dataUrl.includes('base64,') ? dataUrl.split('base64,')[1] : dataUrl;
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.download = `qrcode-${value}.png`;
        link.href = `data:image/png;base64,${base64Data}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        try {
          const filename = `qrcode-${value}.png`;
          const fileUri = (cacheDirectory || '') + filename;
          await writeAsStringAsync(fileUri, base64Data, {
            encoding: EncodingType.Base64,
          });
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'image/png',
              dialogTitle: 'Salvar QR Code',
            });
          } else {
            Alert.alert('Download', 'QR Code salvo em: ' + fileUri);
          }
        } catch (e: any) {
          Alert.alert('Erro', e.message || 'Falha ao baixar QR Code');
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.qrWrapper}>
        <QRCode
          value={value}
          size={200}
          color="#1c1c1c"
          backgroundColor="#fff"
          getRef={(ref) => (qrRef.current = ref)}
        />
      </View>
      <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
        <Text style={styles.downloadText}>Baixar QR Code (PNG)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  qrWrapper: { width: 220, height: 220, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  downloadBtn: { backgroundColor: '#1c1c1c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 12 },
  downloadText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default QRCodeView;
