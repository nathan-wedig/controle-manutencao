import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSidebar } from '../contexts/SidebarContext';

const MenuButton: React.FC = () => {
  const { toggle } = useSidebar();
  return (
    <TouchableOpacity onPress={toggle} style={{ marginLeft: 8, padding: 4 }}>
      <Ionicons name="menu-outline" size={26} color="#fff" />
    </TouchableOpacity>
  );
};

export default MenuButton;
