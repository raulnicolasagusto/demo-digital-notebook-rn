import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface DrawPath {
  path: string;
  color: string;
}

interface CanvasDrawingProps {
  isTextMode: boolean;
  isEraserMode: boolean;
  isDrawing: boolean;
  setIsDrawing: (drawing: boolean) => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  paths: DrawPath[];
  setPaths: React.Dispatch<React.SetStateAction<DrawPath[]>>;
  onCanvasPress?: (evt: any) => void;
  children?: React.ReactNode;
}

export const CanvasDrawing: React.FC<CanvasDrawingProps> = ({
  isTextMode,
  isEraserMode,
  isDrawing,
  setIsDrawing,
  currentPath,
  setCurrentPath,
  paths,
  setPaths,
  onCanvasPress,
  children,
}) => {
  const pathRef = useRef('');

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

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !isTextMode,
    onStartShouldSetPanResponder: () => !isTextMode,
    onPanResponderGrant: (evt) => {
      if (!isTextMode) {
        const { pageX, pageY } = evt.nativeEvent;
        // Ajustar coordenadas relativas al canvas
        const canvasY = pageY - 70; // Aproximadamente la altura del header
        
        if (isEraserMode) {
          // Check if touch point is near any path for erasing
          const pathsToRemove: number[] = [];
          paths.forEach((pathData, index) => {
            if (isPointNearPath(pageX, canvasY, pathData.path)) {
              pathsToRemove.push(index);
            }
          });
          
          // Remove paths that were touched
          if (pathsToRemove.length > 0) {
            setPaths(prev => prev.filter((_, index) => !pathsToRemove.includes(index)));
          }
        } else {
          // Normal drawing mode
          const newPath = `M${pageX.toFixed(2)},${canvasY.toFixed(2)}`;
          pathRef.current = newPath;
          setCurrentPath(newPath);
          setIsDrawing(true);
        }
      }
    },
    onPanResponderMove: (evt) => {
      if (!isTextMode && !isEraserMode && isDrawing) {
        const { pageX, pageY } = evt.nativeEvent;
        // Ajustar coordenadas relativas al canvas
        const canvasY = pageY - 70; // Aproximadamente la altura del header
        const newPath = `${pathRef.current} L${pageX.toFixed(2)},${canvasY.toFixed(2)}`;
        pathRef.current = newPath;
        setCurrentPath(newPath);
      } else if (!isTextMode && isEraserMode) {
        // Continue erasing while moving
        const { pageX, pageY } = evt.nativeEvent;
        const canvasY = pageY - 70;
        
        const pathsToRemove: number[] = [];
        paths.forEach((pathData, index) => {
          if (isPointNearPath(pageX, canvasY, pathData.path)) {
            pathsToRemove.push(index);
          }
        });
        
        // Remove paths that were touched
        if (pathsToRemove.length > 0) {
          setPaths(prev => prev.filter((_, index) => !pathsToRemove.includes(index)));
        }
      }
    },
    onPanResponderRelease: () => {
      if (!isTextMode && !isEraserMode && isDrawing && pathRef.current) {
        // Guardar el path actual antes de resetear
        const completedPath = pathRef.current;
        
        setPaths(prev => {
          const newPaths = [...prev, { path: completedPath, color: '#000000' }];
          return newPaths;
        });
        
        // Resetear estado inmediatamente
        setCurrentPath('');
        setIsDrawing(false);
        pathRef.current = '';
      }
    },
  });

  return (
    <View 
      style={styles.canvas}
      {...panResponder.panHandlers}
      onTouchStart={onCanvasPress}
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
