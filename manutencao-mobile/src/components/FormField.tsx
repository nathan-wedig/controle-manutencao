import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  textarea?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}

const FormField: React.FC<Props> = ({ label, value, onChangeText, placeholder, textarea, keyboardType }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, textarea && styles.textArea]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#ccc"
      multiline={textarea}
      textAlignVertical={textarea ? 'top' : 'center'}
      keyboardType={keyboardType}
    />
  </View>
);

export default FormField;

const styles = StyleSheet.create({
  field: { marginBottom: 2 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, fontSize: 15, borderWidth: 1, borderColor: '#e0e0e0' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
});
