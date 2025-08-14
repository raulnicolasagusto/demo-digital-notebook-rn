import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, PanResponder } from 'react-native';
import Draggable from 'react-native-draggable';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

interface CanvasTextProps {
  isTextMode: boolean;
  textElements: TextElement[];
  setTextElements: React.Dispatch<React.SetStateAction<TextElement[]>>;
  editingText: string | null;
  setEditingText: (id: string | null) => void;
  onCanvasPress: (evt: any) => void;
}

export const CanvasText: React.FC<CanvasTextProps> = ({
  isTextMode,
  textElements,
  setTextElements,
  editingText,
  setEditingText,
  onCanvasPress,
}) => {
  const [resizing, setResizing] = useState<string | null>(null);

  const handleCanvasPress = (evt: any) => {
    if (isTextMode) {
      const { pageX, pageY } = evt.nativeEvent;
      // Ajustar coordenadas relativas al canvas
      const canvasY = pageY - 70; // Aproximadamente la altura del header
      const newTextId = Date.now().toString();
      setTextElements(prev => [...prev, {
        id: newTextId,
        text: '',
        x: pageX,
        y: canvasY,
        width: 150, // Ancho inicial
        height: 80  // Alto inicial
      }]);
      setEditingText(newTextId);
    }
  };

  const handleTextChange = (textId: string, newText: string) => {
    setTextElements(prev => 
      prev.map(element => 
        element.id === textId ? { ...element, text: newText } : element
      )
    );
  };

  const finishTextEditing = () => {
    setEditingText(null);
    setResizing(null);
    // Remove empty text elements
    setTextElements(prev => prev.filter(element => element.text.trim() !== ''));
  };

  // Función para actualizar las dimensiones de un elemento
  const updateElementSize = (elementId: string, newWidth: number, newHeight: number) => {
    setTextElements(prev => 
      prev.map(element => 
        element.id === elementId ? { 
          ...element, 
          width: Math.max(80, newWidth),  // Ancho mínimo
          height: Math.max(40, newHeight) // Alto mínimo
        } : element
      )
    );
  };

  // Función para manejar el redimensionamiento con Draggable
  const handleResize = (elementId: string, initialWidth: number, initialHeight: number, data: any) => {
    const deltaX = data.x;
    const deltaY = data.y;
    const newWidth = initialWidth + deltaX;
    const newHeight = initialHeight + deltaY;
    updateElementSize(elementId, newWidth, newHeight);
  };

  return (
    <>
      {/* Text Elements */}
      {textElements.map((element) => {
        const elementWidth = element.width || 150;
        const elementHeight = element.height || 80;
        const isEditing = editingText === element.id;
        
        return (
          <View
            key={element.id}
            style={[
              styles.textElement,
              { 
                left: element.x, 
                top: element.y,
                width: elementWidth,
                height: elementHeight,
              }
            ]}
            pointerEvents={isTextMode ? "auto" : "none"}
          >
            {isEditing ? (
              <View style={styles.editingContainer}>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      width: elementWidth - 20, // Dejar espacio para el handle
                      height: elementHeight - 20, // Dejar espacio para el handle
                    }
                  ]}
                  value={element.text}
                  onChangeText={(text) => handleTextChange(element.id, text)}
                  onBlur={finishTextEditing}
                  autoFocus
                  multiline
                  placeholder="Escribe aquí..."
                  textAlignVertical="top"
                />
                {/* Handle de redimensionamiento usando Draggable */}
                <Draggable
                  x={elementWidth - 20}
                  y={elementHeight - 20}
                  onDragRelease={(event, gestureState, bounds) => {
                    handleResize(element.id, elementWidth, elementHeight, {
                      x: gestureState.dx,
                      y: gestureState.dy
                    });
                  }}
                  shouldReverse={false}
                  renderSize={24}
                  renderColor="#6D28D9"
                  isCircle={true}
                  touchableOpacityProps={{
                    style: styles.resizeHandle,
                    activeOpacity: 0.7
                  }}
                >
                  <View style={styles.resizeHandleInner} />
                </Draggable>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => setEditingText(element.id)}
                style={[
                  styles.textDisplayContainer,
                  {
                    width: elementWidth,
                    height: elementHeight,
                  }
                ]}
              >
                <Text style={styles.textDisplay}>{element.text}</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </>
  );
};

// Export also the canvas press handler
export const createCanvasTextHandler = (
  isTextMode: boolean,
  setTextElements: React.Dispatch<React.SetStateAction<TextElement[]>>,
  setEditingText: (id: string | null) => void
) => {
  return (evt: any) => {
    if (isTextMode) {
      const { pageX, pageY } = evt.nativeEvent;
      // Ajustar coordenadas relativas al canvas
      const canvasY = pageY - 70; // Aproximadamente la altura del header
      const newTextId = Date.now().toString();
      setTextElements(prev => [...prev, {
        id: newTextId,
        text: '',
        x: pageX,
        y: canvasY,
        width: 150, // Ancho inicial
        height: 80  // Alto inicial
      }]);
      setEditingText(newTextId);
    }
  };
};

const styles = StyleSheet.create({
  textElement: {
    position: 'absolute',
    minWidth: 50,
    minHeight: 30,
  },
  editingContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6D28D9',
    textAlignVertical: 'top',
    minWidth: 80,
    minHeight: 40,
  },
  textDisplay: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  textDisplayContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    paddingVertical: 2,
    width: '100%',
    height: '100%',
  },
  resizeHandle: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 24,
    height: 24,
    backgroundColor: '#6D28D9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resizeHandleInner: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
});
