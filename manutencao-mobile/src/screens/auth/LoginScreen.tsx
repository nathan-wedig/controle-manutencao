import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

const LoginScreen: React.FC = () => {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Erro', 'Preencha usuário e senha');
      return;
    }
    setLoading(true);
    try {
      await signIn(username, password);
    } catch (error: any) {
      let details = '';
      if (error.code === 'ERR_NETWORK') {
        details = `Sem conexão com o servidor\n\nURL: ${error.config?.baseURL}${error.config?.url}\n\nVerifique se o servidor está rodando e acessível na rede.`;
      } else if (error.response) {
        details = `Status: ${error.response.status}\nErro: ${error.response.data?.error || JSON.stringify(error.response.data)}`;
      } else {
        details = `Erro: ${error.message || error}`;
      }
      console.error('Login error:', error);
      Alert.alert('Erro de conexão', details);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Manutenção Industrial</Text>
        <Text style={styles.subtitle}>Sistema de Gerenciamento</Text>
        <View style={styles.form}>
          <Text style={styles.inputLabel}>USUÁRIO</Text>
          <TextInput
            style={styles.input} placeholder="Digite seu usuário" placeholderTextColor="#999"
            value={username} onChangeText={setUsername} autoCapitalize="none"
          />
          <Text style={styles.inputLabel}>SENHA</Text>
          <TextInput
            style={styles.input} placeholder="Digite sua senha" placeholderTextColor="#999"
            value={password} onChangeText={setPassword} secureTextEntry
          />
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
  content: { paddingHorizontal: 32, alignItems: 'center' },
  logo: { width: 120, height: 120, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1c1c1c', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 48 },
  form: { width: '100%', maxWidth: 400 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#1c1c1c', marginBottom: 6, letterSpacing: 1 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 6, padding: 14, fontSize: 15, marginBottom: 20, color: '#333', borderWidth: 1, borderColor: '#e0e0e0' },
  button: { backgroundColor: '#1c1c1c', borderRadius: 6, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
