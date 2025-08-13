import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Pencil, Type, Plus, Eraser } from 'lucide-react-native';

interface FloatingToolButtonProps {
  isTextMode: boolean;
  isEraserMode: boolean;
  onModeChange: (mode: 'draw' | 'text' | 'eraser') => void;
}

export const FloatingToolButton: React.FC<FloatingToolButtonProps> = ({
  isTextMode,
  isEraserMode,
  onModeChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animation values
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const toolsOpacity = useRef(new Animated.Value(0)).current;
  const toolsScale = useRef(new Animated.Value(0)).current;

  const toggleTools = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(rotationAnim, {
        toValue: toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(toolsOpacity, {
        toValue: toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.spring(toolsScale, {
        toValue: toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();
    
    setIsExpanded(!isExpanded);
  };

  const handleToolSelect = (tool: 'draw' | 'text' | 'eraser') => {
    onModeChange(tool);
    toggleTools(); // Close the menu after selection
  };

  return (
    <View style={styles.floatingButtonContainer}>
      {/* Tool Options */}
      {isExpanded && (
        <>
          <Animated.View 
            style={[
              styles.toolOption,
              styles.toolOptionDraw,
              {
                opacity: toolsOpacity,
                transform: [{ scale: toolsScale }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.toolOptionButton, !isTextMode && !isEraserMode && styles.toolOptionActive]}
              onPress={() => handleToolSelect('draw')}
            >
              <Pencil size={20} color={!isTextMode && !isEraserMode ? "#FFFFFF" : "#6D28D9"} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            style={[
              styles.toolOption,
              styles.toolOptionEraser,
              {
                opacity: toolsOpacity,
                transform: [{ scale: toolsScale }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.toolOptionButton, isEraserMode && styles.toolOptionActive]}
              onPress={() => handleToolSelect('eraser')}
            >
              <Eraser size={20} color={isEraserMode ? "#FFFFFF" : "#6D28D9"} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            style={[
              styles.toolOption,
              styles.toolOptionText,
              {
                opacity: toolsOpacity,
                transform: [{ scale: toolsScale }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.toolOptionButton, isTextMode && styles.toolOptionActive]}
              onPress={() => handleToolSelect('text')}
            >
              <Type size={20} color={isTextMode ? "#FFFFFF" : "#6D28D9"} />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      {/* Main FAB */}
      <TouchableOpacity style={styles.floatingButton} onPress={toggleTools}>
        <Animated.View
          style={{
            transform: [{
              rotate: rotationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg']
              })
            }]
          }}
        >
          <Plus size={24} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6D28D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toolOption: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  toolOptionDraw: {
    bottom: 80,
  },
  toolOptionEraser: {
    bottom: 140,
  },
  toolOptionText: {
    bottom: 200,
  },
  toolOptionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  toolOptionActive: {
    backgroundColor: '#6D28D9',
    borderColor: '#6D28D9',
  },
});
