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
    onMoveShouldSetPanResponder: () => !isTextMode,
    onStartShouldSetPanResponder: () => !isTextMode,
    onPanResponderGrant: (evt) => {
      if (!isTextMode) {
        const { pageX, pageY } = evt.nativeEvent;
        // Ajustar coordenadas relativas al canvas
        const canvasY = pageY - 70; // Aproximadamente la altura del header
        
        if (isEraserMode) {
          // Check if touch point is near any path for erasing and segment them
          const updatedPaths: DrawPath[] = [];
          
          paths.forEach((pathData) => {
            if (isPointNearPath(pageX, canvasY, pathData.path)) {
              // Erase from this path and create new segments
              const remainingSegments = eraseFromPath(pathData.path, pageX, canvasY);
              
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
        
        const updatedPaths: DrawPath[] = [];
        
        paths.forEach((pathData) => {
          if (isPointNearPath(pageX, canvasY, pathData.path)) {
            // Erase from this path and create new segments
            const remainingSegments = eraseFromPath(pathData.path, pageX, canvasY);
            
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
