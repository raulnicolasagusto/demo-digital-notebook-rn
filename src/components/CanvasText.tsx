import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
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
        y: canvasY
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
    // Remove empty text elements
    setTextElements(prev => prev.filter(element => element.text.trim() !== ''));
  };

  return (
    <>
      {/* Text Elements */}
      {textElements.map((element) => (
        <View
          key={element.id}
          style={[
            styles.textElement,
            { left: element.x, top: element.y }
          ]}
          pointerEvents={isTextMode ? "auto" : "none"}
        >
          {editingText === element.id ? (
            <TextInput
              style={styles.textInput}
              value={element.text}
              onChangeText={(text) => handleTextChange(element.id, text)}
              onBlur={finishTextEditing}
              onSubmitEditing={finishTextEditing}
              autoFocus
              multiline
              placeholder="Escribe aquí..."
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingText(element.id)}>
              <Text style={styles.textDisplay}>{element.text}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
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
        y: canvasY
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
  textInput: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#6D28D9',
    minWidth: 100,
  },
  textDisplay: {
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
});
