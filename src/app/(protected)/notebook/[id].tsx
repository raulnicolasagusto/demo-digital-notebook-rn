import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { ArrowLeft } from 'lucide-react-native';
import { FloatingToolButton } from '@/components/FloatingToolButton';
import { CanvasDrawing } from '@/components/CanvasDrawing';
import { CanvasText, createCanvasTextHandler } from '@/components/CanvasText';
import { CanvasNoteImages } from '@/components/CanvasNoteImages';
import { ResponsiveCanvas } from '@/components/ResponsiveCanvas';
import { createSupabaseClientWithAuth } from '@/lib/supabase';

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

interface NoteImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  source: any; // Image source
}

export default function NotebookScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [noteImages, setNoteImages] = useState<NoteImage[]>([]);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Create canvas text handler
  const handleCanvasPress = createCanvasTextHandler(
    isTextMode,
    setTextElements,
    setEditingText
  );

  // Handler for adding note images
  const handleAddNoteImage = (x: number, y: number) => {
    if (isNoteMode) {
      const newNoteImage: NoteImage = {
        id: Date.now().toString(),
        x,
        y,
        width: 200,
        height: 200,
        source: require('@/assets/noteImage.png')
      };
      setNoteImages(prev => [...prev, newNoteImage]);
      setIsNoteMode(false);
    }
  };

  // Función para cargar canvas desde la base de datos
  const loadCanvasData = async () => {
    try {
      if (!user || !id) return;

      const token = await getToken();
      if (!token) return;

      const authenticatedSupabase = createSupabaseClientWithAuth(token);

      // Obtener datos de la primera página del cuaderno
      const { data: pageData, error } = await authenticatedSupabase
        .from('notebook_pages')
        .select('canvas_data')
        .eq('notebook_id', id)
        .eq('page_number', 1)
        .single();

      if (error) {
        console.log('Error loading canvas data:', error);
        return;
      }

      if (pageData?.canvas_data) {
        // Cargar paths y elementos de texto
        if (pageData.canvas_data.paths) {
          setPaths(pageData.canvas_data.paths);
        }
        if (pageData.canvas_data.textElements) {
          setTextElements(pageData.canvas_data.textElements);
        }
        if (pageData.canvas_data.noteImages) {
          // Reconstruir noteImages con require() para las sources
          const loadedNoteImages = pageData.canvas_data.noteImages.map((note: any) => ({
            ...note,
            source: require('@/assets/noteImage.png')
          }));
          setNoteImages(loadedNoteImages);
        }
      }
    } catch (error) {
      console.error('Error loading canvas data:', error);
    }
  };

  // Función para guardar canvas en la base de datos
  const saveCanvasData = async () => {
    try {
      if (!user || !id) {
        Alert.alert('Error', 'No se puede guardar: datos de usuario faltantes');
        return;
      }

      setIsSaving(true);

      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'No se pudo obtener el token de autenticación');
        return;
      }

      const authenticatedSupabase = createSupabaseClientWithAuth(token);

      // Preparar datos del canvas
      const canvasData = {
        paths: paths,
        textElements: textElements,
        noteImages: noteImages.map(note => ({
          id: note.id,
          x: note.x,
          y: note.y,
          width: note.width,
          height: note.height
          // No guardamos 'source' ya que es siempre la misma imagen
        }))
      };

      // Actualizar la página del cuaderno
      const { error } = await authenticatedSupabase
        .from('notebook_pages')
        .update({
          canvas_data: canvasData,
          updated_at: new Date().toISOString()
        })
        .eq('notebook_id', id)
        .eq('page_number', 1);

      if (error) throw error;

      Alert.alert('Guardado', 'Cuaderno guardado exitosamente');

    } catch (error: any) {
      console.error('Error saving canvas data:', error);
      Alert.alert('Error', `No se pudo guardar el cuaderno: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCanvasData();
  }, [user, id]);

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

      {/* Responsive Canvas Container */}
      <ResponsiveCanvas>
        <CanvasDrawing
          isTextMode={isTextMode}
          isEraserMode={isEraserMode}
          isNoteMode={isNoteMode}
          isDrawing={isDrawing}
          setIsDrawing={setIsDrawing}
          currentPath={currentPath}
          setCurrentPath={setCurrentPath}
          paths={paths}
          setPaths={setPaths}
          onCanvasPress={handleCanvasPress}
          onNotePress={handleAddNoteImage}
        >
          <CanvasNoteImages 
            noteImages={noteImages}
            onDeleteNote={(noteId) => {
              setNoteImages(prev => prev.filter(note => note.id !== noteId));
            }}
          />
          <CanvasText
            isTextMode={isTextMode}
            textElements={textElements}
            setTextElements={setTextElements}
            editingText={editingText}
            setEditingText={setEditingText}
            onCanvasPress={handleCanvasPress}
          />
        </CanvasDrawing>
      </ResponsiveCanvas>

      {/* Floating Tool Button */}
      <FloatingToolButton
        isTextMode={isTextMode}
        isEraserMode={isEraserMode}
        isNoteMode={isNoteMode}
        onModeChange={(mode) => {
          setIsTextMode(mode === 'text');
          setIsEraserMode(mode === 'eraser');
          setIsNoteMode(mode === 'note');
        }}
        onSave={saveCanvasData}
        onClearNotes={() => {
          Alert.alert(
            'Limpiar Notas',
            '¿Estás seguro de que quieres eliminar todas las notas?',
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Eliminar', 
                style: 'destructive',
                onPress: () => setNoteImages([])
              }
            ]
          );
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
