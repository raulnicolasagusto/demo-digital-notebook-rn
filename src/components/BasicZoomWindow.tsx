import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
  Text,
  Dimensions
} from 'react-native';
import Svg, { Path, Rect, Line } from 'react-native-svg';
import { X, Move } from 'lucide-react-native';

interface BasicZoomWindowProps {
  isActive: boolean;
  onClose: () => void;
  paths: Array<{ path: string; color: string }>;
  onNewPath: (path: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const BasicZoomWindow: React.FC<BasicZoomWindowProps> = ({
  isActive,
  onClose,
  paths,
  onNewPath
}) => {
  const [zoomArea, setZoomArea] = useState({
    x: 400, // Fixed position for now
    y: 500,
    width: 200,
    height: 200
  });

  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  // Simple pan responder for drawing only
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      // Simple coordinate mapping - zoom area coordinates to canvas coordinates
      const canvasX = zoomArea.x + (locationX / 300) * zoomArea.width;
      const canvasY = zoomArea.y + (locationY / 140) * zoomArea.height;
      
      const newPath = `M${canvasX},${canvasY}`;
      setCurrentPath(newPath);
      setIsDrawing(true);
    },
    
    onPanResponderMove: (evt) => {
      if (!isDrawing) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      const canvasX = zoomArea.x + (locationX / 300) * zoomArea.width;
      const canvasY = zoomArea.y + (locationY / 140) * zoomArea.height;
      
      setCurrentPath(prev => `${prev} L${canvasX},${canvasY}`);
    },
    
    onPanResponderRelease: () => {
      if (isDrawing && currentPath) {
        onNewPath(currentPath);
        setCurrentPath('');
      }
      setIsDrawing(false);
    }
  });

  if (!isActive) return null;

  // Filter paths that intersect with zoom area
  const visiblePaths = paths.filter(pathObj => {
    // Simple check if path has any coordinates in the zoom area
    const matches = pathObj.path.match(/(\d+),(\d+)/g);
    if (!matches) return false;
    
    return matches.some(coord => {
      const [x, y] = coord.split(',').map(Number);
      return x >= zoomArea.x && x <= zoomArea.x + zoomArea.width &&
             y >= zoomArea.y && y <= zoomArea.y + zoomArea.height;
    });
  });

  return (
    <>
      {/* Simple zoom indicator */}
      <View style={[styles.indicator, {
        left: 50,
        top: 200,
        width: 100,
        height: 100
      }]}>
        <Move size={12} color="#6D28D9" />
      </View>

      {/* Zoom panel */}
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Zoom (2x)</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <Svg width={300} height={140}>
            {/* Simple grid */}
            <Line x1="0" y1="70" x2="300" y2="70" stroke="#E0E0E0" strokeWidth="1" />
            <Line x1="150" y1="0" x2="150" y2="140" stroke="#E0E0E0" strokeWidth="1" />
            
            {/* Show existing paths in zoom area */}
            {visiblePaths.map((pathObj, index) => {
              // Simple path transformation
              const zoomPath = pathObj.path.replace(/(\d+),(\d+)/g, (match, x, y) => {
                const px = parseFloat(x);
                const py = parseFloat(y);
                const zx = ((px - zoomArea.x) / zoomArea.width) * 300;
                const zy = ((py - zoomArea.y) / zoomArea.height) * 140;
                return `${zx},${zy}`;
              });
              
              return (
                <Path
                  key={index}
                  d={zoomPath}
                  stroke={pathObj.color || "#000000"}
                  strokeWidth="3"
                  fill="none"
                />
              );
            })}
            
            {/* Current drawing path */}
            {currentPath && (
              <Path
                d={currentPath.replace(/(\d+),(\d+)/g, (match, x, y) => {
                  const px = parseFloat(x);
                  const py = parseFloat(y);
                  const zx = ((px - zoomArea.x) / zoomArea.width) * 300;
                  const zy = ((py - zoomArea.y) / zoomArea.height) * 140;
                  return `${zx},${zy}`;
                })}
                stroke="#000000"
                strokeWidth="3"
                fill="none"
              />
            )}
          </Svg>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#6D28D9',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
});