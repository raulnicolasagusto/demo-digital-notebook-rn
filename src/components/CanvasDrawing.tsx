import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import { PermanentCanvas } from './PermanentCanvas';
import { TemporalCanvas } from './TemporalCanvas';
import { 
  optimizeStroke, 
  SMOOTHING_PRESETS,
  pathStringToPoints,
  pointsToPathString 
} from '../utils/strokeSmoothing';

interface DrawPath {
  path: string;
  color: string;
}

interface CanvasDrawingProps {
  isTextMode: boolean;
  isEraserMode: boolean;
  isNoteMode?: boolean;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  paths: DrawPath[];
  setPaths: React.Dispatch<React.SetStateAction<DrawPath[]>>;
  onCanvasPress?: (evt: any) => void;
  onNotePress?: (x: number, y: number) => void;
  children?: React.ReactNode;
}

export const CanvasDrawing: React.FC<CanvasDrawingProps> = ({
  isTextMode,
  isEraserMode,
  isNoteMode = false,
  isDrawing,
  setIsDrawing,
  currentPath,
  setCurrentPath,
  paths,
  setPaths,
  onCanvasPress,
  onNotePress,
  children,
}) => {
  const pathRef = useRef('');
  const canvasViewRef = useRef<View>(null);
  
  // 🚀 FASE 1 OPTIMIZACIONES: Batch Updates + Path Buffer
  const pointsBuffer = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const batchedPath = useRef<string>('');
  
  // Optimized path update with batching
  const flushPathUpdate = useCallback(() => {
    if (batchedPath.current !== currentPath) {
      setCurrentPath(batchedPath.current);
    }
    animationFrameRef.current = null;
  }, [currentPath, setCurrentPath]);
  
  // Schedule batched update
  const scheduleBatchUpdate = useCallback((newPath: string) => {
    batchedPath.current = newPath;
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(flushPathUpdate);
    }
  }, [flushPathUpdate]);
  
  // Cleanup animation frame on unmount
  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Función para convertir coordenadas globales a coordenadas del canvas
  const getCanvasCoordinates = (pageX: number, pageY: number): Promise<{x: number, y: number}> => {
    return new Promise((resolve) => {
      if (canvasViewRef.current) {
        canvasViewRef.current.measure((x, y, width, height, pageXOffset, pageYOffset) => {
          const canvasX = pageX - pageXOffset;
          const canvasY = pageY - pageYOffset;
          resolve({ x: canvasX, y: canvasY });
        });
      } else {
        // Fallback: usar coordenadas directas
        resolve({ x: pageX, y: pageY });
      }
    });
  };

  // Function to check if a point is near a path (for erasing)
  const isPointNearPath = (touchX: number, touchY: number, pathString: string, threshold: number = 20): boolean => {
    // Parse path string to get points
    const pathCommands = pathString.split(/[ML]/);
    for (let i = 1; i < pathCommands.length; i++) {
      const coords = pathCommands[i].trim().split(',');
      if (coords.length === 2) {
        const pathX = parseFloat(coords[0]);
        const pathY = parseFloat(coords[1]);
        const distance = Math.sqrt(Math.pow(touchX - pathX, 2) + Math.pow(touchY - pathY, 2));
        if (distance <= threshold) {
          return true;
        }
      }
    }
    return false;
  };

  // Function to remove segments of a path that are near the eraser point
  const eraseFromPath = (pathString: string, eraseX: number, eraseY: number, threshold: number = 20): string[] => {
    const commands = pathString.split(/([ML])/);
    const resultPaths: string[] = [];
    let currentPath = '';
    let lastValidPoint = '';
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command === 'M' || command === 'L') {
        // Process the next coordinate if it exists
        if (i + 1 < commands.length) {
          const coords = commands[i + 1].trim();
          if (coords) {
            const [x, y] = coords.split(',').map(parseFloat);
            if (!isNaN(x) && !isNaN(y)) {
              const distance = Math.sqrt(Math.pow(eraseX - x, 2) + Math.pow(eraseY - y, 2));
              
              if (distance > threshold) {
                // Point is safe, add to current path
                if (currentPath === '') {
                  currentPath = `M${x},${y}`;
                  lastValidPoint = `${x},${y}`;
                } else {
                  currentPath += ` L${x},${y}`;
                  lastValidPoint = `${x},${y}`;
                }
              } else {
                // Point should be erased
                if (currentPath && currentPath !== `M${lastValidPoint}`) {
                  // Save current path if it has content
                  resultPaths.push(currentPath);
                }
                currentPath = '';
                lastValidPoint = '';
              }
            }
          }
          i++; // Skip the coordinate part since we processed it
        }
      }
    }
    
    // Add the last path if it exists and has meaningful content
    if (currentPath && currentPath.includes('L')) {
      resultPaths.push(currentPath);
    }
    
    return resultPaths;
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !isTextMode && !isNoteMode,
    onStartShouldSetPanResponder: () => !isTextMode && !isNoteMode,
    onPanResponderGrant: (evt) => {
      if (!isTextMode && !isNoteMode) {
        const { locationX, locationY } = evt.nativeEvent;
        // Usar locationX/locationY que son coordenadas relativas al componente
        const canvasX = locationX;
        const canvasY = locationY;
        
        if (isEraserMode) {
          // Check if touch point is near any path for erasing and segment them
          const updatedPaths: DrawPath[] = [];
          
          paths.forEach((pathData) => {
            if (isPointNearPath(canvasX, canvasY, pathData.path)) {
              // Erase from this path and create new segments
              const remainingSegments = eraseFromPath(pathData.path, canvasX, canvasY);
              
              // Add remaining segments as separate paths
              remainingSegments.forEach(segment => {
                if (segment.length > 5) { // Only add meaningful segments
                  updatedPaths.push({ path: segment, color: pathData.color });
                }
              });
            } else {
              // Keep the original path unchanged
              updatedPaths.push(pathData);
            }
          });
          
          setPaths(updatedPaths);
        } else {
          // 🚀 OPTIMIZED: Normal drawing mode with buffer initialization
          const startPoint = `${canvasX.toFixed(1)},${canvasY.toFixed(1)}`;
          pointsBuffer.current = [startPoint];
          
          const newPath = `M${startPoint}`;
          pathRef.current = newPath;
          batchedPath.current = newPath;
          setCurrentPath(newPath); // Set immediately for first point
          setIsDrawing(true);
        }
      }
    },
    onPanResponderMove: (evt) => {
      if (!isTextMode && !isEraserMode && !isNoteMode && isDrawing) {
        const { locationX, locationY } = evt.nativeEvent;
        // Usar locationX/locationY que son coordenadas relativas al componente
        const canvasX = locationX;
        const canvasY = locationY;
        
        // 🚀 OPTIMIZED: Use buffer + batched updates
        const newPoint = `${canvasX.toFixed(1)},${canvasY.toFixed(1)}`;
        pointsBuffer.current.push(newPoint);
        
        // Build path more efficiently
        const newPath = pointsBuffer.current.length === 1 
          ? `M${pointsBuffer.current[0]}`
          : `M${pointsBuffer.current[0]} L${pointsBuffer.current.slice(1).join(' L')}`;
        
        pathRef.current = newPath;
        // Use batched update instead of immediate setState
        scheduleBatchUpdate(newPath);
        
      } else if (!isTextMode && isEraserMode && !isNoteMode) {
        // Continue erasing while moving (keep original logic)
        const { locationX, locationY } = evt.nativeEvent;
        const canvasX = locationX;
        const canvasY = locationY;
        
        const updatedPaths: DrawPath[] = [];
        
        paths.forEach((pathData) => {
          if (isPointNearPath(canvasX, canvasY, pathData.path)) {
            // Erase from this path and create new segments
            const remainingSegments = eraseFromPath(pathData.path, canvasX, canvasY);
            
            // Add remaining segments as separate paths
            remainingSegments.forEach(segment => {
              if (segment.includes('L')) { // Only add segments that have actual drawing content
                updatedPaths.push({ path: segment, color: pathData.color });
              }
            });
          } else {
            // Keep the original path unchanged
            updatedPaths.push(pathData);
          }
        });
        
        setPaths(updatedPaths);
      }
    },
    onPanResponderRelease: () => {
      if (!isTextMode && !isEraserMode && !isNoteMode && isDrawing && pathRef.current) {
        // 🚀 FASE 2: Ensure final update is processed + stroke smoothing
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        // Optimizar el trazo completado usando Douglas-Peucker
        let completedPath = pathRef.current;
        try {
          // Usar configuración balanceada para la mayoría de casos
          completedPath = optimizeStroke(completedPath, SMOOTHING_PRESETS.BALANCED);
        } catch (error) {
          // Si la optimización falla, usar el path original
          console.warn('Stroke optimization failed, using original path');
          completedPath = pathRef.current;
        }
        
        // Flush final path update
        setCurrentPath(completedPath);
        
        setPaths(prev => {
          const newPaths = [...prev, { path: completedPath, color: '#000000' }];
          return newPaths;
        });
        
        // 🚀 OPTIMIZED: Clear all buffers and reset
        setCurrentPath('');
        setIsDrawing(false);
        pathRef.current = '';
        pointsBuffer.current = [];
        batchedPath.current = '';
      }
    },
  });

  return (
    <View 
      ref={canvasViewRef}
      style={styles.canvas}
      {...panResponder.panHandlers}
      onTouchStart={(evt) => {
        // Handle note mode touch
        if (isNoteMode && onNotePress) {
          const { locationX, locationY } = evt.nativeEvent;
          onNotePress(locationX, locationY);
          return;
        }
        
        // Handle other touch events
        if (onCanvasPress) {
          onCanvasPress(evt);
        }
      }}
    >
      {/* 🚀 FASE 2: Separación de capas optimizada */}
      
      {/* Capa permanente: Solo se re-renderiza cuando paths cambian */}
      <PermanentCanvas 
        paths={paths} 
        strokeWidth={2} 
      />
      
      {/* Capa temporal: Solo se re-renderiza durante el dibujo activo */}
      {currentPath && isDrawing && (
        <TemporalCanvas 
          currentPath={currentPath}
          strokeColor="#000000"
          strokeWidth={2}
        />
      )}
      
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
