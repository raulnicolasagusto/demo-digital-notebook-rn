import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { ArrowLeft } from 'lucide-react-native';
import { FloatingToolButton } from '@/components/FloatingToolButton';
import { CanvasDrawing } from '@/components/CanvasDrawing';
import { CanvasText, createCanvasTextHandler } from '@/components/CanvasText';
import { CanvasNoteImages } from '@/components/CanvasNoteImages';
import { ResponsiveCanvas, CanvasViewInfo } from '@/components/ResponsiveCanvas';
import { PageNavigation } from '@/components/PageNavigation';
import { createSupabaseClientWithAuth } from '@/lib/supabase';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { BackgroundPicker } from '@/components/BackgroundPicker';
import { CanvasBackground } from '@/components/CanvasBackground';
import { CanvasWithZoomWindow } from '@/components/CanvasWithZoomWindow';
import { Stroke, Rect } from '@/utils/geometry';

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
  const [isMagnifyingGlassMode, setIsMagnifyingGlassMode] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [noteImages, setNoteImages] = useState<NoteImage[]>([]);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para manejo de páginas
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Estados para navegación inmersiva
  const [isNavigationBarVisible, setIsNavigationBarVisible] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<any>(null);

  // Estados para fondo del canvas
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);

  // Estado para información del canvas view
  const [canvasViewInfo, setCanvasViewInfo] = useState<CanvasViewInfo>({
    containerWidth: 0,
    containerHeight: 0,
    canvasDisplayWidth: 960,
    canvasDisplayHeight: 1200,
    scale: 1.0
  });

  // Estados para el nuevo sistema de Zoom Window
  const [zoomTargetRect, setZoomTargetRect] = useState<Rect>({
    x: 480 - 60, // Centrado en X
    y: 600 - 60, // Centrado en Y  
    width: 120,
    height: 120
  });

  // Referencia para el handler de la lupa
  const magnifyingGlassHandler = useRef<((x: number, y: number) => void) | null>(null);

  // Función para registrar el handler de toque del canvas desde CanvasWithZoomWindow
  const registerCanvasTouchHandler = useCallback((handler: (x: number, y: number) => void) => {
    magnifyingGlassHandler.current = handler;
  }, []);

  // Función para convertir DrawPath a Stroke
  const convertDrawPathToStroke = (drawPath: DrawPath): Stroke => {
    // Parsear el path SVG para extraer puntos
    const points: { x: number; y: number }[] = [];
    const pathRegex = /([ML])(\d+\.?\d*),(\d+\.?\d*)/g;
    let match;
    
    while ((match = pathRegex.exec(drawPath.path)) !== null) {
      const x = parseFloat(match[2]);
      const y = parseFloat(match[3]);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
      }
    }

    return {
      id: `stroke-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      points,
      width: 2, // Grosor predeterminado
      color: drawPath.color,
      opacity: 1,
      tool: 'pen'
    };
  };

  // Función para convertir Stroke a DrawPath
  const convertStrokeToDrawPath = (stroke: Stroke): DrawPath => {
    if (stroke.points.length === 0) {
      return { path: '', color: stroke.color };
    }

    let path = `M${stroke.points[0].x},${stroke.points[0].y}`;
    for (let i = 1; i < stroke.points.length; i++) {
      path += ` L${stroke.points[i].x},${stroke.points[i].y}`;
    }

    return {
      path,
      color: stroke.color
    };
  };

  // Convertir paths existentes a strokes
  const canvasStrokes: Stroke[] = paths.map(convertDrawPathToStroke);

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

  // Funciones para navegación inmersiva
  const setupImmersiveMode = async () => {
    if (Platform.OS === 'android') {
      try {
        // Solo ocultar la barra de navegación, sin cambiar el comportamiento
        await NavigationBar.setVisibilityAsync('hidden');
        // Comentamos setBehaviorAsync ya que causa warnings con edge-to-edge
        // await NavigationBar.setBehaviorAsync('overlay-swipe');
        setIsNavigationBarVisible(false);
      } catch (error) {
        console.log('Error setting up immersive mode:', error);
      }
    }
  };

  const showNavigationBar = async () => {
    if (Platform.OS === 'android') {
      try {
        await NavigationBar.setVisibilityAsync('visible');
        setIsNavigationBarVisible(true);
        
        // Auto-ocultar después de 3 segundos
        if (hideTimeout) {
          clearTimeout(hideTimeout);
        }
        
        const timeout = setTimeout(async () => {
          await NavigationBar.setVisibilityAsync('hidden');
          setIsNavigationBarVisible(false);
        }, 3000);
        
        setHideTimeout(timeout);
      } catch (error) {
        console.log('Error showing navigation bar:', error);
      }
    }
  };

  const handleScreenTouch = () => {
    // Mostrar barra de navegación al tocar la pantalla
    if (Platform.OS === 'android' && !isNavigationBarVisible) {
      showNavigationBar();
    }
  };

  // Función para cargar canvas de una página específica
  const loadCanvasData = async (pageNumber: number = currentPage) => {
    try {
      if (!user || !id) return;

      setIsLoadingPage(true);
      const token = await getToken();
      if (!token) return;

      const authenticatedSupabase = createSupabaseClientWithAuth(token);

      // Obtener total de páginas del cuaderno
      const { data: pagesCount, error: countError } = await authenticatedSupabase
        .from('notebook_pages')
        .select('page_number')
        .eq('notebook_id', id);

      if (!countError && pagesCount) {
        const maxPage = Math.max(...pagesCount.map(p => p.page_number));
        setTotalPages(maxPage);
      }

      // Obtener datos de la página específica
      const { data: pageData, error } = await authenticatedSupabase
        .from('notebook_pages')
        .select('canvas_data')
        .eq('notebook_id', id)
        .eq('page_number', pageNumber)
        .single();

      if (error) {
        // Si no existe la página, crear una vacía
        if (error.code === 'PGRST116') {
          console.log('Página no existe, creando página vacía');
          setPaths([]);
          setTextElements([]);
          setNoteImages([]);
          setSelectedBackground(null);
        } else {
          console.log('Error loading canvas data:', error);
        }
        return;
      }

      if (pageData?.canvas_data) {
        // Cargar paths y elementos de texto
        if (pageData.canvas_data.paths) {
          setPaths(pageData.canvas_data.paths);
        } else {
          setPaths([]);
        }
        
        if (pageData.canvas_data.textElements) {
          setTextElements(pageData.canvas_data.textElements);
        } else {
          setTextElements([]);
        }
        
        if (pageData.canvas_data.noteImages) {
          // Reconstruir noteImages con require() para las sources
          const loadedNoteImages = pageData.canvas_data.noteImages.map((note: any) => ({
            ...note,
            source: require('@/assets/noteImage.png')
          }));
          setNoteImages(loadedNoteImages);
        } else {
          setNoteImages([]);
        }

        // Cargar fondo de la página
        if (pageData.canvas_data.backgroundId) {
          setSelectedBackground(pageData.canvas_data.backgroundId);
        } else {
          setSelectedBackground(null);
        }
      }
    } catch (error) {
      console.error('Error loading canvas data:', error);
    } finally {
      setIsLoadingPage(false);
    }
  };

  // Función para guardar canvas en la página actual
  const saveCanvasData = async (pageNumber: number = currentPage) => {
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
        })),
        backgroundId: selectedBackground // Agregar fondo del canvas
      };

      // Usar upsert para crear o actualizar la página
      const { error } = await authenticatedSupabase
        .from('notebook_pages')
        .upsert({
          notebook_id: id,
          page_number: pageNumber,
          canvas_data: canvasData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'notebook_id,page_number'
        });

      if (error) throw error;

      Alert.alert('Guardado', `Página ${pageNumber} guardada exitosamente`);

    } catch (error: any) {
      console.error('Error saving canvas data:', error);
      Alert.alert('Error', `No se pudo guardar la página: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Función para cambiar de página
  const handlePageChange = async (newPage: number) => {
    if (newPage === currentPage || isLoadingPage) return;

    // Guardar página actual antes de cambiar
    await saveCanvasData(currentPage);
    
    // Cambiar a nueva página
    setCurrentPage(newPage);
    await loadCanvasData(newPage);
  };

  // Función para agregar una nueva página
  const handleAddPage = async () => {
    if (isLoadingPage) return;

    // Guardar página actual
    await saveCanvasData(currentPage);
    
    // Crear nueva página
    const newPageNumber = totalPages + 1;
    setTotalPages(newPageNumber);
    setCurrentPage(newPageNumber);
    
    // Limpiar canvas para nueva página
    setPaths([]);
    setTextElements([]);
    setNoteImages([]);
    setSelectedBackground(null);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCanvasData(1); // Cargar primera página
  }, [user, id]);

  // Configurar modo inmersivo
  useEffect(() => {
    setupImmersiveMode();
    
    // Limpiar timeout al desmontar
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      // Restaurar navegación normal al salir
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible').catch(() => {});
      }
    };
  }, []);

  return (
    <View style={styles.container} onTouchStart={handleScreenTouch}>
      <StatusBar style="auto" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setShowBackgroundPicker(true)} 
          style={styles.backgroundButton}
        >
          <Text style={styles.backgroundButtonText}>Fondo</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cuaderno {id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Canvas Principal */}
      {!isMagnifyingGlassMode ? (
        /* Modo normal - Canvas tradicional */
        <ResponsiveCanvas
          pathsLength={paths.length}
          textElementsLength={textElements.length}
          isMagnifyingGlassMode={isMagnifyingGlassMode}
          onCanvasViewInfoChange={setCanvasViewInfo}
          onMagnifyingGlassTouch={(x, y) => {
            // Llamar al handler registrado por MagnifyingGlassTool
            if (magnifyingGlassHandler.current) {
              magnifyingGlassHandler.current(x, y);
            }
          }}
        >
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
            <CanvasBackground
              backgroundId={selectedBackground}
              width={960}
              height={1200}
            />
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
      ) : (
        /* Modo Zoom Window - Nuevo sistema estilo GoodNotes */
        <CanvasWithZoomWindow
          canvasWidth={960}
          canvasHeight={1200}
          targetRect={zoomTargetRect}
          onChangeTargetRect={setZoomTargetRect}
          zoomWindowWidth={canvasViewInfo.containerWidth}
          zoomWindowHeight={300}
          zoomFactor={3.0}
          strokes={canvasStrokes}
          onAddStroke={(stroke: Stroke) => {
            const drawPath = convertStrokeToDrawPath(stroke);
            setPaths(prev => [...prev, drawPath]);
          }}
          onUpdateStrokePartial={(id: string, partial: Partial<Stroke>) => {
            // Manejar actualizaciones parciales en tiempo real si es necesario
            console.log('Stroke update:', id, partial);
          }}
          onCommitStroke={(id: string) => {
            // Manejar finalización de stroke si es necesario
            console.log('Stroke committed:', id);
          }}
          onClearArea={() => {
            // Limpiar solo los strokes dentro del área objetivo
            const filteredPaths = paths.filter(path => {
              const stroke = convertDrawPathToStroke(path);
              return !stroke.points.some(point => 
                point.x >= zoomTargetRect.x && point.x <= zoomTargetRect.x + zoomTargetRect.width &&
                point.y >= zoomTargetRect.y && point.y <= zoomTargetRect.y + zoomTargetRect.height
              );
            });
            setPaths(filteredPaths);
          }}
          strokeStyle={{
            width: 2,
            color: '#000000',
            opacity: 1,
            scaleStrokeToTarget: true
          }}
          isActive={isMagnifyingGlassMode}
          onClose={() => setIsMagnifyingGlassMode(false)}
          onCanvasTouchHandler={registerCanvasTouchHandler}
        >
          <ResponsiveCanvas
            pathsLength={paths.length}
            textElementsLength={textElements.length}
            isMagnifyingGlassMode={true}
            onCanvasViewInfoChange={setCanvasViewInfo}
            onMagnifyingGlassTouch={(x, y) => {
              // Llamar al handler registrado por CanvasWithZoomWindow
              if (magnifyingGlassHandler.current) {
                magnifyingGlassHandler.current(x, y);
              }
            }}
          >
            <CanvasDrawing
              isTextMode={false} // En modo zoom, solo mostrar contenido, no interactuar
              isEraserMode={false}
              isNoteMode={false}
              isDrawing={false}
              setIsDrawing={() => {}} // No-op
              currentPath=""
              setCurrentPath={() => {}} // No-op
              paths={paths}
              setPaths={() => {}} // No-op, las modificaciones vienen del zoom window
              onCanvasPress={() => {}} // No-op
              onNotePress={() => {}} // No-op
            >
              <CanvasBackground
                backgroundId={selectedBackground}
                width={960}
                height={1200}
              />
              <CanvasNoteImages 
                noteImages={noteImages}
                onDeleteNote={() => {}} // No-op en modo zoom
              />
              <CanvasText
                isTextMode={false}
                textElements={textElements}
                setTextElements={() => {}} // No-op
                editingText={null}
                setEditingText={() => {}} // No-op
                onCanvasPress={() => {}} // No-op
              />
            </CanvasDrawing>
          </ResponsiveCanvas>
        </CanvasWithZoomWindow>
      )}

      {/* Page Navigation */}
      <PageNavigation
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onAddPage={handleAddPage}
      />

      {/* Floating Tool Button */}
      <FloatingToolButton
        isTextMode={isTextMode}
        isEraserMode={isEraserMode}
        isNoteMode={isNoteMode}
        isMagnifyingGlassMode={isMagnifyingGlassMode}
        onModeChange={(mode) => {
          setIsTextMode(mode === 'text');
          setIsEraserMode(mode === 'eraser');
          setIsNoteMode(mode === 'note');
          setIsMagnifyingGlassMode(mode === 'magnifyingGlass');
        }}
        onSave={() => saveCanvasData(currentPage)}
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

      {/* Background Picker Modal */}
      <BackgroundPicker
        visible={showBackgroundPicker}
        onClose={() => setShowBackgroundPicker(false)}
        onSelectBackground={setSelectedBackground}
        selectedBackground={selectedBackground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'android' ? 0 : 0, // Sin padding adicional en modo inmersivo
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
  backgroundButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#6D28D9',
    borderRadius: 6,
    marginLeft: 8,
  },
  backgroundButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
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
