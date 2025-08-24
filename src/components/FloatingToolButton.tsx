import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Pencil, Type, Plus, Eraser, Save, StickyNote, Trash2, ZoomIn } from 'lucide-react-native';

interface FloatingToolButtonProps {
  isTextMode: boolean;
  isEraserMode: boolean;
  isNoteMode?: boolean;
  isZoomMode?: boolean;
  onModeChange: (mode: 'draw' | 'text' | 'eraser' | 'note' | 'zoom') => void;
  onSave?: () => void;
  onClearNotes?: () => void;
}

export const FloatingToolButton: React.FC<FloatingToolButtonProps> = ({
  isTextMode,
  isEraserMode,
  isNoteMode = false,
  isZoomMode = false,
  onModeChange,
  onSave,
  onClearNotes,
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

  const handleToolSelect = (tool: 'draw' | 'text' | 'eraser' | 'note' | 'zoom') => {
    onModeChange(tool);
    toggleTools(); // Close the menu after selection
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    toggleTools(); // Close the menu after save
  };

  const handleClearNotes = () => {
    if (onClearNotes) {
      onClearNotes();
    }
    toggleTools(); // Close the menu after clear
  };

  return (
    <View style={styles.floatingButtonContainer}>
      {/* Tool Options */}
      {isExpanded && (
        <>
          <Animated.View 
            style={[
              styles.toolOption,
              styles.toolOptionSave,
              {
                opacity: toolsOpacity,
                transform: [{ scale: toolsScale }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.toolOptionButton}
              onPress={handleSave}
            >
              <Save size={20} color="#6D28D9" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            style={[
              styles.toolOption,
              styles.toolOptionClearNotes,
              {
                opacity: toolsOpacity,
                transform: [{ scale: toolsScale }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.toolOptionButton}
              onPress={handleClearNotes}
            >
              <Trash2 size={20} color="#DC2626" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            style={[
              styles.toolOption,
              styles.toolOptionZoom,
              {
                opacity: toolsOpacity,
                transform: [{ scale: toolsScale }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.toolOptionButton, isZoomMode && styles.toolOptionActive]}
              onPress={() => handleToolSelect('zoom')}
            >
              <ZoomIn size={20} color={isZoomMode ? "#FFFFFF" : "#6D28D9"} />
            </TouchableOpacity>
          </Animated.View>

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
              style={[styles.toolOptionButton, !isTextMode && !isEraserMode && !isNoteMode && !isZoomMode && styles.toolOptionActive]}
              onPress={() => handleToolSelect('draw')}
            >
              <Pencil size={20} color={!isTextMode && !isEraserMode && !isNoteMode && !isZoomMode ? "#FFFFFF" : "#6D28D9"} />
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

          <Animated.View 
            style={[
              styles.toolOption,
              styles.toolOptionNote,
              {
                opacity: toolsOpacity,
                transform: [{ scale: toolsScale }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.toolOptionButton, isNoteMode && styles.toolOptionActive]}
              onPress={() => handleToolSelect('note')}
            >
              <StickyNote size={20} color={isNoteMode ? "#FFFFFF" : "#6D28D9"} />
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
  toolOptionNote: {
    bottom: 260,
  },
  toolOptionZoom: {
    bottom: 320,
  },
  toolOptionSave: {
    bottom: 380,
  },
  toolOptionClearNotes: {
    bottom: 440,
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
