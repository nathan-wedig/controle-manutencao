import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Loading: React.FC = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#1c1c1c" />
  </View>
);

export default Loading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
