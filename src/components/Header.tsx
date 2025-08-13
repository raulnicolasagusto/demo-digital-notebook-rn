import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  title: string;
  onMenuPress: () => void;
}

export default function Header({ title, onMenuPress }: HeaderProps) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.header, { backgroundColor: colors.surface }]}>
      <TouchableOpacity style={[styles.menuButton, { backgroundColor: colors.background }]} onPress={onMenuPress}>
        <Menu size={24} color={colors.text} />
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60, // Para el safe area
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 999,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
    flex: 1,
  },
  spacer: {
    width: 40, // Para balancear el botón del menú
  },
});
