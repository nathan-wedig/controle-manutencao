import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const BackButton: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const handleBack = () => {
    const params: any = route.params;
    const fromMaquinaId = params?.fromMaquinaId;
    const isOrdScreen = route.name === 'OSDetail' || route.name === 'OSForm';

    if (isOrdScreen && fromMaquinaId) {
      navigation.popToTop();
      navigation.navigate('MaquinasTab' as never, { screen: 'MaquinaDetail', params: { id: fromMaquinaId } } as never);
      return;
    }
    navigation.goBack();
  };

  return (
    <TouchableOpacity onPress={handleBack} style={{ padding: 8 }}>
      <Ionicons name="arrow-back-circle-outline" size={26} color="#fff" />
    </TouchableOpacity>
  );
};

export default BackButton;
