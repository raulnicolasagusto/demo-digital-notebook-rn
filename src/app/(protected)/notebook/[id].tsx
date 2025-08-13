import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Dimensions, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Pencil, Type, ArrowLeft } from 'lucide-react-native';

interface DrawPath {
  path: string;
  color: string;
}

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
}

export default function NotebookScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [editingText, setEditingText] = useState<string | null>(null);
  const pathRef = useRef('');

  const screenData = Dimensions.get('window');

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !isTextMode,
    onPanResponderGrant: (evt) => {
      if (!isTextMode) {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
        pathRef.current = newPath;
        setCurrentPath(newPath);
        setIsDrawing(true);
      }
    },
    onPanResponderMove: (evt) => {
      if (!isTextMode && isDrawing) {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `${pathRef.current} L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
        pathRef.current = newPath;
        setCurrentPath(newPath);
      }
    },
    onPanResponderRelease: () => {
      if (!isTextMode && isDrawing) {
        setPaths(prev => [...prev, { path: pathRef.current, color: '#000000' }]);
        setCurrentPath('');
        setIsDrawing(false);
        pathRef.current = '';
      }
    },
  });

  const handleCanvasPress = (evt: any) => {
    if (isTextMode) {
      const { locationX, locationY } = evt.nativeEvent;
      const newTextId = Date.now().toString();
      setTextElements(prev => [...prev, {
        id: newTextId,
        text: '',
        x: locationX,
        y: locationY
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Cuaderno {id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tools */}
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={[styles.toolButton, !isTextMode && styles.toolButtonActive]}
          onPress={() => setIsTextMode(false)}
        >
          <Pencil size={20} color={!isTextMode ? "#FFFFFF" : "#374151"} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toolButton, isTextMode && styles.toolButtonActive]}
          onPress={() => setIsTextMode(true)}
        >
          <Type size={20} color={isTextMode ? "#FFFFFF" : "#374151"} />
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View 
        style={styles.canvas}
        {...panResponder.panHandlers}
        onTouchStart={handleCanvasPress}
      >
        <Svg style={StyleSheet.absoluteFillObject}>
          {paths.map((pathData, index) => (
            <Path
              key={index}
              d={pathData.path}
              stroke={pathData.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {currentPath && (
            <Path
              d={currentPath}
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>

        {/* Text Elements */}
        {textElements.map((element) => (
          <View
            key={element.id}
            style={[
              styles.textElement,
              { left: element.x, top: element.y }
            ]}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  toolButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  toolButtonActive: {
    backgroundColor: '#6D28D9',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
