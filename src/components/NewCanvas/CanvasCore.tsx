import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions, PanResponder } from 'react-native';
import { Canvas, Path, Skia, Group } from '@shopify/react-native-skia';
import { DrawPath, Point, CanvasState, CanvasDimensions } from './types';

interface CanvasCoreProps {
  canvasState: CanvasState;
  onPathAdd: (path: DrawPath) => void;
  onPathUpdate: (pathId: string, points: Point[]) => void;
  mode: 'draw' | 'text' | 'zoom';
  strokeColor?: string;
  strokeWidth?: number;
  isEnabled?: boolean;
}

// Canvas dimensions optimized for tablet (iPad Pro 12.9" ratio)
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 1600;

export const CanvasCore: React.FC<CanvasCoreProps> = ({
  canvasState,
  onPathAdd,
  onPathUpdate,
  mode,
  strokeColor = '#000000',
  strokeWidth = 3,
  isEnabled = true
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  
  // Current drawing state
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Calculate canvas scale to fit screen while maintaining aspect ratio
  const canvasDimensions: CanvasDimensions = useMemo(() => {
    const availableWidth = screenWidth - 40; // 20px margin each side
    const availableHeight = screenHeight - 160; // Space for header and tools
    
    const scaleX = availableWidth / CANVAS_WIDTH;
    const scaleY = availableHeight / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY); // Remove the 1 limit for mobile
    
    return {
      width: CANVAS_WIDTH * scale,
      height: CANVAS_HEIGHT * scale,
      scale
    };
  }, [screenWidth, screenHeight]);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((x: number, y: number): Point => {
    // Direct coordinate mapping - no scaling conversion needed for Skia
    console.log('Direct coords:', x, y); // Debug
    return {
      x: x,
      y: y
    };
  }, []);

  // Create Skia path from points
  const createSkiaPath = useCallback((points: Point[]) => {
    const path = Skia.Path.Make();
    if (points.length > 0) {
      path.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        path.lineTo(points[i].x, points[i].y);
      }
    }
    return path;
  }, []);

  // Simple PanResponder for drawing (more stable than Gesture Handler)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isEnabled && mode === 'draw',
    onMoveShouldSetPanResponder: () => isEnabled && mode === 'draw',

    onPanResponderGrant: (event) => {
      console.log('Pan responder grant - drawing starting'); // Debug
      const { locationX, locationY } = event.nativeEvent;
      console.log('Touch coordinates:', locationX, locationY); // Debug
      const canvasPoint = screenToCanvas(locationX, locationY);
      console.log('Canvas coordinates:', canvasPoint); // Debug
      
      const newPath: DrawPath = {
        id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        points: [canvasPoint],
        color: strokeColor,
        strokeWidth: strokeWidth,
        tool: 'pen'
      };
      
      console.log('New path created:', newPath); // Debug
      setCurrentPath(newPath);
      setIsDrawing(true);
    },

    onPanResponderMove: (event) => {
      if (!isDrawing || !currentPath) return;
      
      const { locationX, locationY } = event.nativeEvent;
      const canvasPoint = screenToCanvas(locationX, locationY);
      console.log('Adding point:', canvasPoint); // Debug
      
      const updatedPath = {
        ...currentPath,
        points: [...currentPath.points, canvasPoint]
      };
      
      setCurrentPath(updatedPath);
    },

    onPanResponderRelease: () => {
      console.log('Pan responder release'); // Debug
      if (isDrawing && currentPath) {
        console.log('Finalizing path with points:', currentPath.points.length); // Debug
        onPathAdd(currentPath);
        setCurrentPath(null);
      }
      setIsDrawing(false);
    }
  });

  // Render all completed paths
  const renderPaths = useMemo(() => {
    console.log('Rendering paths, total:', canvasState.paths.length); // Debug
    return canvasState.paths.map((path, index) => {
      console.log(`Rendering path ${index}:`, path.points.length, 'points'); // Debug
      return (
        <Path
          key={path.id}
          path={createSkiaPath(path.points)}
          color={path.color}
          style="stroke"
          strokeWidth={path.strokeWidth}
          strokeJoin="round"
          strokeCap="round"
        />
      );
    });
  }, [canvasState.paths, createSkiaPath]);

  // Render current drawing path
  const renderCurrentPath = useMemo(() => {
    if (!currentPath) return null;
    
    console.log('Rendering current path:', currentPath.points.length, 'points'); // Debug
    return (
      <Path
        path={createSkiaPath(currentPath.points)}
        color={currentPath.color}
        style="stroke"
        strokeWidth={currentPath.strokeWidth}
        strokeJoin="round"
        strokeCap="round"
      />
    );
  }, [currentPath, createSkiaPath]);

  return (
    <View style={styles.container}>
      <View 
        style={[
          styles.canvasContainer,
          {
            width: canvasDimensions.width,
            height: canvasDimensions.height
          }
        ]}
        {...panResponder.panHandlers}
      >
        <Canvas
          style={styles.canvas}
        >
          <Group>
            {/* Background - white canvas */}
            <Path
              path={`M 0 0 L ${canvasDimensions.width} 0 L ${canvasDimensions.width} ${canvasDimensions.height} L 0 ${canvasDimensions.height} Z`}
              color="white"
              style="fill"
            />
            
            {/* Completed paths */}
            {renderPaths}
            
            {/* Current drawing path */}
            {renderCurrentPath}
          </Group>
        </Canvas>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  canvasContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  canvas: {
    flex: 1,
    borderRadius: 8,
  },
});