import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Pencil, Type, ZoomIn, Plus, Save } from 'lucide-react-native';
import { CanvasMode } from './types';

interface FloatingMenuProps {
  currentMode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
  onSave?: () => void;
  disabled?: boolean;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  currentMode,
  onModeChange,
  onSave,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleMenu = () => {
    if (disabled) return;
    setIsExpanded(!isExpanded);
  };

  const handleModeSelect = (mode: CanvasMode) => {
    onModeChange(mode);
    setIsExpanded(false); // Close menu after selection
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    setIsExpanded(false);
  };

  return (
    <View style={styles.container}>
      {/* Menu Options - Simple visibility toggle */}
      {isExpanded && !disabled && (
        <>
          {/* Save Button */}
          <View style={[styles.menuOption, { bottom: 200 }]}>
            <TouchableOpacity
              style={[styles.optionButton, styles.saveButton]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Save size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.optionLabel}>Guardar</Text>
          </View>

          {/* Zoom Button */}
          <View style={[styles.menuOption, { bottom: 160 }]}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                currentMode === 'zoom' && styles.optionButtonActive
              ]}
              onPress={() => handleModeSelect('zoom')}
              activeOpacity={0.7}
            >
              <ZoomIn 
                size={20} 
                color={currentMode === 'zoom' ? "#FFFFFF" : "#6D28D9"} 
              />
            </TouchableOpacity>
            <Text style={styles.optionLabel}>Zoom</Text>
          </View>

          {/* Text Button */}
          <View style={[styles.menuOption, { bottom: 120 }]}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                currentMode === 'text' && styles.optionButtonActive
              ]}
              onPress={() => handleModeSelect('text')}
              activeOpacity={0.7}
            >
              <Type 
                size={20} 
                color={currentMode === 'text' ? "#FFFFFF" : "#6D28D9"} 
              />
            </TouchableOpacity>
            <Text style={styles.optionLabel}>Texto</Text>
          </View>

          {/* Draw Button */}
          <View style={[styles.menuOption, { bottom: 80 }]}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                currentMode === 'draw' && styles.optionButtonActive
              ]}
              onPress={() => handleModeSelect('draw')}
              activeOpacity={0.7}
            >
              <Pencil 
                size={20} 
                color={currentMode === 'draw' ? "#FFFFFF" : "#6D28D9"} 
              />
            </TouchableOpacity>
            <Text style={styles.optionLabel}>Dibujar</Text>
          </View>
        </>
      )}

      {/* Main FAB - No complex animations */}
      <TouchableOpacity 
        style={[
          styles.mainButton,
          disabled && styles.mainButtonDisabled
        ]} 
        onPress={toggleMenu}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {isExpanded ? (
          <Plus size={24} color="#FFFFFF" style={{ transform: [{ rotate: '45deg' }] }} />
        ) : (
          <Plus size={24} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  mainButtonDisabled: {
    backgroundColor: '#9CA3AF',
    elevation: 4,
    shadowOpacity: 0.2,
  },
  menuOption: {
    position: 'absolute',
    alignItems: 'center',
  },
  optionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  optionButtonActive: {
    backgroundColor: '#6D28D9',
    borderColor: '#6D28D9',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  optionLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});