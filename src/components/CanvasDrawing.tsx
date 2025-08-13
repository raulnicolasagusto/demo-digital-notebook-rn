import React, { useRef } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface DrawPath {
  path: string;
  color: string;
}

interface CanvasDrawingProps {
  isTextMode: boolean;
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

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => !isTextMode,
    onStartShouldSetPanResponder: () => !isTextMode,
    onPanResponderGrant: (evt) => {
      if (!isTextMode) {
        const { pageX, pageY } = evt.nativeEvent;
        // Ajustar coordenadas relativas al canvas
        const canvasY = pageY - 70; // Aproximadamente la altura del header
        const newPath = `M${pageX.toFixed(2)},${canvasY.toFixed(2)}`;
        pathRef.current = newPath;
        setCurrentPath(newPath);
        setIsDrawing(true);
      }
    },
    onPanResponderMove: (evt) => {
      if (!isTextMode && isDrawing) {
        const { pageX, pageY } = evt.nativeEvent;
        // Ajustar coordenadas relativas al canvas
        const canvasY = pageY - 70; // Aproximadamente la altura del header
        const newPath = `${pathRef.current} L${pageX.toFixed(2)},${canvasY.toFixed(2)}`;
        pathRef.current = newPath;
        setCurrentPath(newPath);
      }
    },
    onPanResponderRelease: () => {
      if (!isTextMode && isDrawing && pathRef.current) {
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
