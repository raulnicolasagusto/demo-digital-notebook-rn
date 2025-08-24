import React, { useState, useRef, useCallback, useEffect } from 'react';
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Text
} from 'react-native';
import { X, Move } from 'lucide-react-native';

interface DrawPath {
  path: string;
  color: string;
}

interface ZoomArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface GoodNotesZoomWindowProps {
  // Canvas dimensions
  canvasWidth: number;
  canvasHeight: number;
  
  // Current paths from main canvas
  canvasPaths: DrawPath[];
  
  // Drawing callbacks - these will be called on the main canvas
  onStartDrawing: (x: number, y: number) => void;
  onContinueDrawing: (x: number, y: number) => void;
  onEndDrawing: () => void;
  
  // Zoom window state
  isActive: boolean;
  onClose: () => void;
  
  // Canvas content to zoom
  children?: React.ReactNode;
  
  // Optional customization
  zoomFactor?: number;
  windowHeight?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const GoodNotesZoomWindow: React.FC<GoodNotesZoomWindowProps> = ({
  canvasWidth,
  canvasHeight,
  canvasPaths,
  onStartDrawing,
  onContinueDrawing,
  onEndDrawing,
  isActive,
  onClose,
  children,
  zoomFactor = 3,
  windowHeight = 200
}) => {
  // Zoom area state (the area being magnified)
  const [zoomArea, setZoomArea] = useState<ZoomArea>({
    x: canvasWidth / 2 - 60,  // Center horizontally
    y: canvasHeight / 2 - 60, // Center vertically
    width: 120,
    height: 120
  });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);

  // Zoom window dimensions
  const zoomWindowWidth = screenWidth - 40; // 20px margin on each side
  const zoomWindowInnerHeight = windowHeight - 60; // Space for header

  // Calculate zoom area bounds
  const maxZoomX = canvasWidth - zoomArea.width;
  const maxZoomY = canvasHeight - zoomArea.height;

  // Pan responder for moving the zoom area indicator
  const zoomAreaPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: () => {
      // Store initial position when pan starts
    },
    
    onPanResponderMove: (_, gestureState) => {
      // Safety checks to prevent crashes
      if (!gestureState || isNaN(gestureState.dx) || isNaN(gestureState.dy)) return;
      
      // Convert screen movement to canvas coordinates
      const screenToCanvasX = (gestureState.dx / Math.max(1, screenWidth - 40)) * canvasWidth;
      const screenToCanvasY = (gestureState.dy / Math.max(1, screenHeight - windowHeight - 200)) * canvasHeight;
      
      const newX = Math.max(0, Math.min(maxZoomX, zoomArea.x + screenToCanvasX));
      const newY = Math.max(0, Math.min(maxZoomY, zoomArea.y + screenToCanvasY));
      
      setZoomArea(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    }
  });

  // Pan responder for drawing in the zoom window - calls main canvas functions
  const drawingPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      // Ensure we're within drawing bounds
      if (locationX < 0 || locationX > zoomWindowWidth ||
          locationY < 0 || locationY > zoomWindowInnerHeight) {
        return;
      }
      
      // Convert zoom coordinates to canvas coordinates with safety checks
      const safeZoomWindowWidth = Math.max(1, zoomWindowWidth);
      const safeZoomWindowHeight = Math.max(1, zoomWindowInnerHeight);
      const safeZoomAreaWidth = Math.max(1, zoomArea.width);
      const safeZoomAreaHeight = Math.max(1, zoomArea.height);
      
      const canvasX = zoomArea.x + (locationX / safeZoomWindowWidth) * safeZoomAreaWidth;
      const canvasY = zoomArea.y + (locationY / safeZoomWindowHeight) * safeZoomAreaHeight;
      
      // Start drawing on the main canvas
      onStartDrawing(canvasX, canvasY);
      setIsDrawing(true);
      isDrawingRef.current = true;
    },
    
    onPanResponderMove: (evt) => {
      if (!isDrawingRef.current) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      
      // Ensure we're within drawing bounds
      if (locationX < 0 || locationX > zoomWindowWidth ||
          locationY < 0 || locationY > zoomWindowInnerHeight) {
        return;
      }
      
      // Convert zoom coordinates to canvas coordinates with safety checks
      const safeZoomWindowWidth = Math.max(1, zoomWindowWidth);
      const safeZoomWindowHeight = Math.max(1, zoomWindowInnerHeight);
      const safeZoomAreaWidth = Math.max(1, zoomArea.width);
      const safeZoomAreaHeight = Math.max(1, zoomArea.height);
      
      const canvasX = zoomArea.x + (locationX / safeZoomWindowWidth) * safeZoomAreaWidth;
      const canvasY = zoomArea.y + (locationY / safeZoomWindowHeight) * safeZoomAreaHeight;
      
      // Continue drawing on the main canvas
      onContinueDrawing(canvasX, canvasY);
    },
    
    onPanResponderRelease: () => {
      if (!isDrawingRef.current) return;
      
      // End drawing on the main canvas
      onEndDrawing();
      
      // Reset drawing state
      setIsDrawing(false);
      isDrawingRef.current = false;
    }
  });

  // Filter canvas paths that are visible in the zoom area
  const getVisiblePaths = useCallback((): DrawPath[] => {
    return canvasPaths.filter(pathObj => {
      // Simple check: if path string contains coordinates within zoom area
      const pathString = pathObj.path;
      const matches = pathString.match(/([ML])(\d+\.?\d*),(\d+\.?\d*)/g);
      
      if (!matches) return false;
      
      return matches.some(match => {
        const coords = match.match(/(\d+\.?\d*),(\d+\.?\d*)/);
        if (!coords) return false;
        
        const x = parseFloat(coords[1]);
        const y = parseFloat(coords[2]);
        
        return x >= zoomArea.x && x <= zoomArea.x + zoomArea.width &&
               y >= zoomArea.y && y <= zoomArea.y + zoomArea.height;
      });
    });
  }, [canvasPaths, zoomArea]);

  // Convert canvas path to zoom window coordinates
  const convertPathToZoomCoords = useCallback((pathObj: DrawPath): string => {
    const pathString = pathObj.path;
    
    return pathString.replace(/([ML])(\d+\.?\d*),(\d+\.?\d*)/g, (match, command, x, y) => {
      const canvasX = parseFloat(x);
      const canvasY = parseFloat(y);
      
      // Convert to zoom window coordinates
      const zoomX = ((canvasX - zoomArea.x) / zoomArea.width) * zoomWindowWidth;
      const zoomY = ((canvasY - zoomArea.y) / zoomArea.height) * zoomWindowInnerHeight;
      
      return `${command}${zoomX},${zoomY}`;
    });
  }, [zoomArea, zoomWindowWidth, zoomWindowInnerHeight]);

  // Local paths management - no automatic reset to avoid infinite loops

  if (!isActive) return null;

  // Safety checks to prevent crashes
  if (!canvasWidth || !canvasHeight || canvasWidth <= 0 || canvasHeight <= 0) {
    return null;
  }

  if (!screenWidth || !screenHeight || screenWidth <= 0 || screenHeight <= 0) {
    return null;
  }

  return (
    <>
      {/* Zoom Area Indicator on Main Canvas */}
      <View style={[styles.zoomIndicator, {
        left: 20 + (zoomArea.x / canvasWidth) * (screenWidth - 40),
        top: 100 + (zoomArea.y / canvasHeight) * (screenHeight - windowHeight - 200),
        width: (zoomArea.width / canvasWidth) * (screenWidth - 40),
        height: (zoomArea.height / canvasHeight) * (screenHeight - windowHeight - 200)
      }]} {...zoomAreaPanResponder.panHandlers}>
        <View style={styles.zoomIndicatorBorder}>
          <Move size={16} color="#6D28D9" style={styles.moveIcon} />
        </View>
      </View>

      {/* Bottom Zoom Window */}
      <View style={[styles.zoomWindow, { height: windowHeight }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Zoom Area (3x)</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Drawing Area - This will contain a clone of the main canvas */}
        <View style={styles.drawingArea} {...drawingPanResponder.panHandlers}>
          {/* We'll render this as a transformed view of the main canvas */}
          <View style={{
            width: zoomWindowWidth,
            height: zoomWindowInnerHeight,
            backgroundColor: '#FFFFFF',
            overflow: 'hidden'
          }}>
            {/* Grid overlay for precision */}
            <View style={styles.gridOverlay}>
              {Array.from({ length: Math.floor(zoomWindowWidth / 20) }).map((_, i) => (
                <View
                  key={`v${i}`}
                  style={[
                    styles.gridLine,
                    {
                      left: i * 20,
                      width: 1,
                      height: zoomWindowInnerHeight
                    }
                  ]}
                />
              ))}
              {Array.from({ length: Math.floor(zoomWindowInnerHeight / 20) }).map((_, i) => (
                <View
                  key={`h${i}`}
                  style={[
                    styles.gridLine,
                    {
                      top: i * 20,
                      height: 1,
                      width: zoomWindowWidth
                    }
                  ]}
                />
              ))}
            </View>
            
            {/* Canvas content will be rendered here by the parent component */}
            <View style={styles.canvasClone}>
              {/* Render the actual canvas content with safer transform */}
              <View style={{
                position: 'absolute',
                width: canvasWidth,
                height: canvasHeight,
                left: -zoomArea.x,
                top: -zoomArea.y,
                transform: [{ scale: zoomFactor }],
                transformOrigin: '0 0'
              }}>
                {children}
              </View>
            </View>
          </View>
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
  zoomIndicatorBorder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveIcon: {
    opacity: 0.7,
  },
  zoomWindow: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  canvasClone: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
});