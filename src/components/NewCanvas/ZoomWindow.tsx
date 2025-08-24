import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, useWindowDimensions, PanResponder } from 'react-native';
import { Canvas, Path, Skia, Group } from '@shopify/react-native-skia';
import { X, Move } from 'lucide-react-native';
import { DrawPath, Point } from './types';

interface ZoomWindowProps {
  isActive: boolean;
  onClose: () => void;
  canvasWidth: number;
  canvasHeight: number;
  paths: DrawPath[];
  onPathAdd: (path: DrawPath) => void;
  strokeColor?: string;
  strokeWidth?: number;
}

const ZOOM_SCALE = 3;
const ZOOM_WINDOW_HEIGHT = 180;

export const ZoomWindow: React.FC<ZoomWindowProps> = ({
  isActive,
  onClose,
  canvasWidth,
  canvasHeight,
  paths,
  onPathAdd,
  strokeColor = '#000000',
  strokeWidth = 3
}) => {
  const { width: screenWidth } = useWindowDimensions();
  
  // Movable zoom area
  const [zoomArea, setZoomArea] = useState({
    x: 50, // Initial position on screen
    y: 100,
    width: 200,
    height: 150
  });

  // Current drawing state
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Zoom window dimensions
  const zoomWindowWidth = screenWidth - 40;
  const zoomWindowDrawHeight = ZOOM_WINDOW_HEIGHT - 40; // Space for header

  // Refs to avoid re-creation of PanResponder
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Memoized PanResponder to prevent re-creation
  const zoomAreaPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (event) => {
      console.log('Starting drag');
      // Capture current position at start of drag
      setZoomArea(current => {
        dragStartRef.current = { x: current.x, y: current.y };
        return current;
      });
    },

    onPanResponderMove: (event, gestureState) => {
      const { dx, dy } = gestureState;
      
      // Calculate new position from drag start + delta
      const newX = Math.max(0, Math.min(screenWidth - 200, dragStartRef.current.x + dx));
      const newY = Math.max(50, Math.min(500, dragStartRef.current.y + dy));
      
      console.log('Moving to:', newX, newY);
      setZoomArea(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    },

    onPanResponderRelease: () => {
      console.log('Drag ended');
    }
  }), [screenWidth]);

  // Simple drawing with PanResponder (more stable)
  const drawingPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      console.log('Zoom drawing start:', locationX, locationY);
      
      // Convert zoom coordinates to screen coordinates
      const screenX = zoomArea.x + (locationX / zoomWindowWidth) * zoomArea.width;
      const screenY = zoomArea.y + (locationY / zoomWindowDrawHeight) * zoomArea.height;
      
      const newPath: DrawPath = {
        id: `zoom_path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        points: [{ x: screenX, y: screenY }],
        color: strokeColor,
        strokeWidth: strokeWidth,
        tool: 'pen'
      };
      
      setCurrentPath(newPath);
      setIsDrawing(true);
    },

    onPanResponderMove: (event) => {
      if (!isDrawing || !currentPath) return;
      
      const { locationX, locationY } = event.nativeEvent;
      
      // Convert zoom coordinates to screen coordinates
      const screenX = zoomArea.x + (locationX / zoomWindowWidth) * zoomArea.width;
      const screenY = zoomArea.y + (locationY / zoomWindowDrawHeight) * zoomArea.height;
      
      const updatedPath = {
        ...currentPath,
        points: [...currentPath.points, { x: screenX, y: screenY }]
      };
      
      setCurrentPath(updatedPath);
    },

    onPanResponderRelease: () => {
      console.log('Zoom drawing end');
      if (isDrawing && currentPath) {
        console.log('Adding zoom path with', currentPath.points.length, 'points');
        onPathAdd(currentPath);
        setCurrentPath(null);
      }
      setIsDrawing(false);
    }
  });

  // Create Skia path from points
  const createSkiaPath = (points: Point[]) => {
    const path = Skia.Path.Make();
    if (points.length > 0) {
      path.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        path.lineTo(points[i].x, points[i].y);
      }
    }
    return path;
  };

  if (!isActive) return null;

  // Filter visible paths in zoom area
  const visiblePaths = paths.filter(path => {
    return path.points.some(point => 
      point.x >= zoomArea.x && point.x <= zoomArea.x + zoomArea.width &&
      point.y >= zoomArea.y && point.y <= zoomArea.y + zoomArea.height
    );
  });

  return (
    <>
      {/* Zoom area indicator - movable */}
      <View 
        style={[
          styles.zoomIndicator,
          {
            left: zoomArea.x,
            top: zoomArea.y,
            width: zoomArea.width,
            height: zoomArea.height,
          }
        ]}
        {...zoomAreaPanResponder.panHandlers}
      >
        <View style={styles.indicatorBorder}>
          <View style={styles.dragHandle}>
            <Move size={20} color="#6D28D9" />
            <Text style={styles.moveText}>MOVER</Text>
          </View>
        </View>
      </View>

      {/* Bottom zoom window */}
      <View style={[styles.zoomWindow, { height: ZOOM_WINDOW_HEIGHT }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Zoom Writing ({ZOOM_SCALE}x)</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Drawing area */}
        <View style={styles.drawingArea} {...drawingPanResponder.panHandlers}>
          <Canvas style={styles.canvas}>
            <Group>
              {/* Background */}
              <Path
                path={`M 0 0 L ${zoomWindowWidth} 0 L ${zoomWindowWidth} ${zoomWindowDrawHeight} L 0 ${zoomWindowDrawHeight} Z`}
                color="white"
                style="fill"
              />
              
              {/* Grid for precision */}
              {Array.from({ length: Math.floor(zoomWindowWidth / 30) }).map((_, i) => (
                <Path
                  key={`v${i}`}
                  path={`M ${i * 30} 0 L ${i * 30} ${zoomWindowDrawHeight}`}
                  color="#E5E7EB"
                  style="stroke"
                  strokeWidth={0.5}
                />
              ))}
              {Array.from({ length: Math.floor(zoomWindowDrawHeight / 30) }).map((_, i) => (
                <Path
                  key={`h${i}`}
                  path={`M 0 ${i * 30} L ${zoomWindowWidth} ${i * 30}`}
                  color="#E5E7EB"
                  style="stroke"
                  strokeWidth={0.5}
                />
              ))}

              {/* Render visible paths scaled to zoom window */}
              {visiblePaths.map(path => {
                const zoomPoints = path.points.map(point => ({
                  x: ((point.x - zoomArea.x) / zoomArea.width) * zoomWindowWidth,
                  y: ((point.y - zoomArea.y) / zoomArea.height) * zoomWindowDrawHeight
                })).filter(point => 
                  point.x >= 0 && point.x <= zoomWindowWidth &&
                  point.y >= 0 && point.y <= zoomWindowDrawHeight
                );

                if (zoomPoints.length < 2) return null;

                return (
                  <Path
                    key={path.id}
                    path={createSkiaPath(zoomPoints)}
                    color={path.color}
                    style="stroke"
                    strokeWidth={path.strokeWidth * ZOOM_SCALE}
                    strokeJoin="round"
                    strokeCap="round"
                  />
                );
              })}

              {/* Current drawing path */}
              {currentPath && (
                <Path
                  path={createSkiaPath(currentPath.points.map(point => ({
                    x: ((point.x - zoomArea.x) / zoomArea.width) * zoomWindowWidth,
                    y: ((point.y - zoomArea.y) / zoomArea.height) * zoomWindowDrawHeight
                  })))}
                  color={currentPath.color}
                  style="stroke"
                  strokeWidth={currentPath.strokeWidth * ZOOM_SCALE}
                  strokeJoin="round"
                  strokeCap="round"
                />
              )}
            </Group>
          </Canvas>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  zoomIndicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#6D28D9',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
    zIndex: 1000,
  },
  indicatorBorder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    backgroundColor: 'rgba(109, 40, 217, 0.9)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  moveText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  zoomWindow: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    height: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  drawingArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  canvas: {
    flex: 1,
  },
});