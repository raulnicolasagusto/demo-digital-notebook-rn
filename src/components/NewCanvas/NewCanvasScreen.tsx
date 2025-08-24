import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { ArrowLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

import { CanvasCore } from './CanvasCore';
import { FloatingMenu } from './FloatingMenu';
import { ZoomWindow } from './ZoomWindow';
import { DrawPath, CanvasState, CanvasMode } from './types';
import { createSupabaseClientWithAuth } from '@/lib/supabase';

export const NewCanvasScreen: React.FC = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  // Canvas state
  const [canvasState, setCanvasState] = useState<CanvasState>({
    paths: [],
    textElements: [],
    backgroundId: undefined
  });

  // UI state
  const [currentMode, setCurrentMode] = useState<CanvasMode>('draw');
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Page management
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(false);

  // Canvas dimensions (optimized for tablets)
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 1600;

  // Setup immersive mode for Android
  const setupImmersiveMode = async () => {
    if (Platform.OS === 'android') {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
      } catch (error) {
        console.log('Error setting up immersive mode:', error);
      }
    }
  };

  // Load canvas data from database
  const loadCanvasData = useCallback(async (pageNumber: number = currentPage) => {
    try {
      if (!user || !id) return;

      setIsLoadingPage(true);
      const token = await getToken();
      if (!token) return;

      const authenticatedSupabase = createSupabaseClientWithAuth(token);

      // Get page data
      const { data: pageData, error } = await authenticatedSupabase
        .from('notebook_pages')
        .select('canvas_data')
        .eq('notebook_id', id)
        .eq('page_number', pageNumber)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Error loading canvas data:', error);
        return;
      }

      if (pageData?.canvas_data) {
        // Convert legacy path format to new format
        const legacyPaths = pageData.canvas_data.paths || [];
        const newPaths: DrawPath[] = legacyPaths.map((legacyPath: any, index: number) => ({
          id: `legacy_${pageNumber}_${index}`,
          points: parsePathToPoints(legacyPath.path || ''),
          color: legacyPath.color || '#000000',
          strokeWidth: 3,
          tool: 'pen' as const
        }));

        setCanvasState({
          paths: newPaths,
          textElements: pageData.canvas_data.textElements || [],
          backgroundId: pageData.canvas_data.backgroundId
        });
      } else {
        // Empty page
        setCanvasState({
          paths: [],
          textElements: [],
          backgroundId: undefined
        });
      }
    } catch (error) {
      console.error('Error loading canvas data:', error);
    } finally {
      setIsLoadingPage(false);
    }
  }, [user, id, getToken]); // Remove currentPage from dependencies

  // Save canvas data to database
  const saveCanvasData = useCallback(async (pageNumber: number = currentPage) => {
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

      // Convert new paths format to legacy format for database compatibility
      const legacyPaths = canvasState.paths.map(path => ({
        path: pointsToPath(path.points),
        color: path.color
      }));

      const canvasData = {
        paths: legacyPaths,
        textElements: canvasState.textElements,
        backgroundId: canvasState.backgroundId
      };

      // Upsert page data
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
  }, [user, id, canvasState, getToken]);

  // Convert SVG path string to points array
  const parsePathToPoints = (pathString: string): Array<{x: number, y: number}> => {
    const points: Array<{x: number, y: number}> = [];
    const matches = pathString.match(/([ML])(\d+\.?\d*),(\d+\.?\d*)/g);
    
    if (matches) {
      matches.forEach(match => {
        const coords = match.match(/(\d+\.?\d*),(\d+\.?\d*)/);
        if (coords) {
          points.push({
            x: parseFloat(coords[1]),
            y: parseFloat(coords[2])
          });
        }
      });
    }
    
    return points;
  };

  // Convert points array to SVG path string
  const pointsToPath = (points: Array<{x: number, y: number}>): string => {
    if (points.length === 0) return '';
    
    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L${points[i].x},${points[i].y}`;
    }
    
    return path;
  };

  // Handle path addition
  const handlePathAdd = useCallback((path: DrawPath) => {
    console.log('Adding path:', path); // Debug log
    setCanvasState(prev => ({
      ...prev,
      paths: [...prev.paths, path]
    }));
  }, []);

  // Handle path update during drawing
  const handlePathUpdate = useCallback((pathId: string, points: Array<{x: number, y: number}>) => {
    // This is called during drawing for real-time updates
    // We don't need to update state here as CanvasCore manages current path internally
  }, []);

  // Handle mode changes
  const handleModeChange = useCallback((mode: CanvasMode) => {
    setCurrentMode(mode);
    setIsZoomActive(mode === 'zoom');
  }, []);

  // Initialize
  useEffect(() => {
    setupImmersiveMode();
    loadCanvasData(1);
    
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible').catch(() => {});
      }
    };
  }, []); // Empty dependencies - only run once

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Cuaderno {id}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main Canvas */}
      <CanvasCore
        canvasState={canvasState}
        onPathAdd={handlePathAdd}
        onPathUpdate={handlePathUpdate}
        mode={currentMode}
        strokeColor="#000000"
        strokeWidth={3}
        isEnabled={true} // Always enabled for now
      />

      {/* Zoom Window */}
      <ZoomWindow
        isActive={isZoomActive}
        onClose={() => handleModeChange('draw')}
        canvasWidth={CANVAS_WIDTH}
        canvasHeight={CANVAS_HEIGHT}
        paths={canvasState.paths}
        onPathAdd={handlePathAdd}
        strokeColor="#000000"
        strokeWidth={3}
      />

      {/* Floating Menu */}
      <FloatingMenu
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onSave={() => saveCanvasData(currentPage)}
        disabled={isSaving || isLoadingPage}
      />
    </View>
  );
};

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