import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, TextInput, Platform, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { maquinasApi } from '../../api/maquinas';
import { MaquinasStackParamList } from '../../navigation/MainTabNavigator';

type Nav = NativeStackNavigationProp<MaquinasStackParamList, 'MaquinaList'>;

const QRCodeScannerScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [scanned, setScanned] = useState(false);
  const [codigoInput, setCodigoInput] = useState('');
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (!permission) { return; }
      if (permission.granted) { setCameraAvailable(true); return; }
      if (permission.canAskAgain) {
        requestPermission().then(result => {
          if (result.granted) setCameraAvailable(true);
          else setCameraAvailable(false);
        });
      } else {
        setCameraAvailable(false);
      }
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { stream.getTracks().forEach(t => t.stop()); setCameraAvailable(true); })
        .catch(() => setCameraAvailable(false));
    } else {
      setCameraAvailable(false);
    }
  }, [permission]);

  const handleCodigoSubmit = async () => {
    if (!codigoInput.trim()) return;
    try {
      const maquina = await maquinasApi.buscarPorCodigo(codigoInput.trim());
      navigation.navigate('MaquinaDetail', { id: maquina.id });
    } catch { Alert.alert('Erro', 'Máquina não encontrada com este código'); }
  };

  if (cameraAvailable === false) {
    return (
      <View style={styles.center}>
        <Ionicons name="qr-code-outline" size={64} color="#999" />
        {Platform.OS !== 'web' && permission && !permission.canAskAgain && !permission.granted ? (
          <>
            <Text style={styles.permissionText}>Permissão de câmera negada</Text>
            <Text style={{ fontSize: 14, color: '#999', marginTop: 4 }}>Ative nas configurações do dispositivo</Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={() => Linking.openSettings()}>
              <Text style={styles.permissionBtnText}>Abrir Configurações</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.permissionText}>Câmera não disponível</Text>
            <Text style={{ fontSize: 14, color: '#999', marginTop: 4 }}>Digite o código da máquina:</Text>
            <TextInput style={styles.webInput} placeholder="Ex: 123" value={codigoInput} onChangeText={setCodigoInput}
              onSubmitEditing={handleCodigoSubmit} keyboardType="number-pad" />
            <TouchableOpacity style={styles.permissionBtn} onPress={handleCodigoSubmit}><Text style={styles.permissionBtnText}>Buscar</Text></TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  if (cameraAvailable === null) {
    return <View style={styles.center}><Text>Verificando câmera...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : async ({ data }: { data: string }) => {
          if (scanned) return;
          setScanned(true);
          try {
            const maquina = await maquinasApi.buscarPorQrcode(data);
            navigation.navigate('MaquinaDetail', { id: maquina.id });
          } catch { Alert.alert('Erro', 'QRCode não reconhecido', [{ text: 'OK', onPress: () => setScanned(false) }]); }
        }}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>
          <View style={styles.scanArea} />
          <Text style={styles.hint}>Aponte para o QRCode da máquina</Text>
          {Platform.OS === 'web' ? (
            <TouchableOpacity style={styles.manualLink} onPress={() => setCameraAvailable(false)}>
              <Text style={styles.manualLinkText}>Digitar código manualmente</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </CameraView>
      {scanned && <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}><Text style={styles.rescanText}>Escanear novamente</Text></TouchableOpacity>}
    </View>
  );
};

export default QRCodeScannerScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 32 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  scanArea: { width: 250, height: 250, borderRadius: 20, borderWidth: 3, borderColor: '#1c1c1c', backgroundColor: 'transparent' },
  hint: { color: '#fff', fontSize: 15, marginTop: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, overflow: 'hidden' },
  permissionText: { fontSize: 16, color: '#666', marginTop: 16, textAlign: 'center' },
  permissionBtn: { backgroundColor: '#1c1c1c', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  permissionBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  rescanBtn: { position: 'absolute', bottom: 60, alignSelf: 'center', backgroundColor: '#1c1c1c', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 28, elevation: 6 },
  rescanText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  webInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, width: '80%', marginTop: 12, textAlign: 'center' },
  manualLink: { marginTop: 24, paddingVertical: 8, paddingHorizontal: 16 },
  manualLinkText: { color: '#fff', fontSize: 14, textDecorationLine: 'underline', textAlign: 'center' },
});
