import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FloatingToolButton } from '@/components/FloatingToolButton';
import { CanvasDrawing } from '@/components/CanvasDrawing';
import { CanvasText, createCanvasTextHandler } from '@/components/CanvasText';

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
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [editingText, setEditingText] = useState<string | null>(null);

  // Create canvas text handler
  const handleCanvasPress = createCanvasTextHandler(
    isTextMode,
    setTextElements,
    setEditingText
  );

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

      {/* Canvas with Drawing and Text */}
      <CanvasDrawing
        isTextMode={isTextMode}
        isEraserMode={isEraserMode}
        isDrawing={isDrawing}
        setIsDrawing={setIsDrawing}
        currentPath={currentPath}
        setCurrentPath={setCurrentPath}
        paths={paths}
        setPaths={setPaths}
        onCanvasPress={handleCanvasPress}
      >
        <CanvasText
          isTextMode={isTextMode}
          textElements={textElements}
          setTextElements={setTextElements}
          editingText={editingText}
          setEditingText={setEditingText}
          onCanvasPress={handleCanvasPress}
        />
      </CanvasDrawing>

      {/* Floating Tool Button */}
      <FloatingToolButton
        isTextMode={isTextMode}
        isEraserMode={isEraserMode}
        onModeChange={(mode) => {
          setIsTextMode(mode === 'text');
          setIsEraserMode(mode === 'eraser');
        }}
      />
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
});
