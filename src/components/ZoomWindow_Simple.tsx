import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  PanResponder, 
  Dimensions
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { X, Target, ZoomIn, RotateCcw } from 'lucide-react-native';

interface DrawPath {
  path: string;
  color: string;
}

interface ZoomWindowSimpleProps {
  isActive: boolean;
  onClose: () => void;
  onDrawingUpdate: (paths: DrawPath[]) => void;
  canvasWidth: number;
  canvasHeight: number;
  canvasPaths: DrawPath[];
  canvasScale: number;
  canvasOffset: { x: number; y: number };
  onCanvasTouchHandler?: (handler: (x: number, y: number) => void) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ZOOM_AREA_HEIGHT = 280;
const AREA_SIZE = 120;

export const ZoomWindowSimple: React.FC<ZoomWindowSimpleProps> = ({
  isActive,
  onClose,
  onDrawingUpdate,
  canvasWidth,
  canvasHeight,
  canvasPaths,
  canvasScale,
  canvasOffset,
  onCanvasTouchHandler
}) => {
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [zoomPaths, setZoomPaths] = useState<DrawPath[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (isActive) {
      // Registrar el handler para toques del canvas
      if (onCanvasTouchHandler) {
        onCanvasTouchHandler(handleCanvasTouch);
      }
      
      // Auto-cerrar las instrucciones después de 3 segundos
      const instructionTimeout = setTimeout(() => {
        if (showInstructions) {
          setShowInstructions(false);
        }
      }, 3000);
      
      return () => clearTimeout(instructionTimeout);
    }
  }, [isActive, showInstructions]);

  // Efecto para el panel de zoom
  useEffect(() => {
    if (isActive && selectedArea) {
      Animated.timing(slideAnim, {
        toValue: screenHeight - ZOOM_AREA_HEIGHT,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [isActive, selectedArea]);

  const handleCanvasTouch = (x: number, y: number) => {
    if (!selectedArea) {
      setSelectedArea({ x, y });
      setShowInstructions(false);
    }
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (!selectedArea) return;
      
      setIsDrawing(true);
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(`M${locationX},${locationY}`);
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing || !selectedArea) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
    },
    onPanResponderRelease: () => {
      if (!isDrawing || !currentPath || !selectedArea) return;
      
      const newPath: DrawPath = {
        path: currentPath,
        color: '#000000'
      };
      
      const updatedZoomPaths = [...zoomPaths, newPath];
      setZoomPaths(updatedZoomPaths);
      
      // Convertir el path del zoom al canvas y enviarlo
      const canvasPath = convertZoomPathToCanvasPath(newPath, selectedArea);
      if (canvasPath && canvasPaths) {
        const allCanvasPaths = [...canvasPaths, canvasPath];
        onDrawingUpdate(allCanvasPaths);
      }
      
      setCurrentPath('');
      setIsDrawing(false);
    },
  });

  // Convierte un path del zoom window a coordenadas del canvas
  const convertZoomPathToCanvasPath = (zoomPath: DrawPath, area: { x: number; y: number }): DrawPath | null => {
    if (!zoomPath || !zoomPath.path || !area) return null;
    
    try {
      const areaLeftX = area.x - AREA_SIZE / 2;
      const areaTopY = area.y - AREA_SIZE / 2;
      const zoomAreaWidth = screenWidth - 40; // Menos márgenes
      const zoomAreaHeight = ZOOM_AREA_HEIGHT - 120; // Menos header y padding

      const canvasPath = zoomPath.path
        .replace(/M(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const zoomX = parseFloat(x);
          const zoomY = parseFloat(y);
          
          if (isNaN(zoomX) || isNaN(zoomY)) return match;
          
          // Convertir de coordenadas del zoom a coordenadas del canvas
          const canvasX = areaLeftX + (zoomX * AREA_SIZE / zoomAreaWidth);
          const canvasY = areaTopY + (zoomY * AREA_SIZE / zoomAreaHeight);
          
          return `M${canvasX},${canvasY}`;
        })
        .replace(/L(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const zoomX = parseFloat(x);
          const zoomY = parseFloat(y);
          
          if (isNaN(zoomX) || isNaN(zoomY)) return match;
          
          // Convertir de coordenadas del zoom a coordenadas del canvas
          const canvasX = areaLeftX + (zoomX * AREA_SIZE / zoomAreaWidth);
          const canvasY = areaTopY + (zoomY * AREA_SIZE / zoomAreaHeight);
          
          return `L${canvasX},${canvasY}`;
        });

      return {
        ...zoomPath,
        path: canvasPath
      };
    } catch (error) {
      console.error('Error converting zoom path to canvas path:', error);
      return null;
    }
  };

  const clearDrawing = () => {
    setZoomPaths([]);
    // Limpiar también del canvas los paths de esta área
    if (selectedArea && canvasPaths && canvasPaths.length > 0) {
      try {
        const areaLeftX = selectedArea.x - AREA_SIZE / 2;
        const areaTopY = selectedArea.y - AREA_SIZE / 2;
        const areaRightX = selectedArea.x + AREA_SIZE / 2;
        const areaBottomY = selectedArea.y + AREA_SIZE / 2;

        // Filtrar paths que NO están en esta área
        const pathsOutsideArea = canvasPaths.filter(pathData => {
          if (!pathData || !pathData.path) return false;
          
          // Verificar si algún punto del path está fuera del área
          let isOutsideArea = true;
          pathData.path.replace(/[ML](\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
            const px = parseFloat(x);
            const py = parseFloat(y);
            if (!isNaN(px) && !isNaN(py) && 
                px >= areaLeftX && px <= areaRightX && py >= areaTopY && py <= areaBottomY) {
              isOutsideArea = false;
            }
            return match;
          });
          return isOutsideArea;
        });

        onDrawingUpdate(pathsOutsideArea);
      } catch (error) {
        console.error('Error clearing drawing:', error);
        onDrawingUpdate([]);
      }
    } else {
      onDrawingUpdate([]);
    }
  };

  const selectNewArea = () => {
    setSelectedArea(null);
    setShowInstructions(true);
  };

  if (!isActive) return null;

  return (
    <>
      {/* Overlay de instrucciones */}
      {showInstructions && (
        <View style={styles.instructionOverlay}>
          <View style={styles.instructionCard}>
            <ZoomIn size={32} color="#6D28D9" />
            <Text style={styles.instructionTitle}>Área de Escritura</Text>
            <Text style={styles.instructionText}>
              Toca el área del canvas donde quieres escribir con precisión
            </Text>
          </View>
        </View>
      )}

      {/* Indicador de área seleccionada en el canvas */}
      {selectedArea && (
        <View 
          style={[
            styles.selectedAreaIndicator,
            {
              left: selectedArea.x - AREA_SIZE / 2,
              top: selectedArea.y - AREA_SIZE / 2,
              width: AREA_SIZE,
              height: AREA_SIZE,
            }
          ]}
        >
          <View style={styles.areaFrame} />
        </View>
      )}

      {/* Panel de zoom inferior */}
      {selectedArea && (
        <Animated.View 
          style={[
            styles.zoomPanel,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={styles.headerLeft}>
              <ZoomIn size={20} color="#6D28D9" />
              <Text style={styles.panelTitle}>Área de Escritura - 3x</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={selectNewArea}>
                <Target size={16} color="#374151" />
                <Text style={styles.headerButtonText}>Nueva</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={clearDrawing}>
                <RotateCcw size={16} color="#374151" />
                <Text style={styles.headerButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeHeaderButton} onPress={onClose}>
                <X size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.zoomArea} {...panResponder.panHandlers}>
            <Svg
              height={ZOOM_AREA_HEIGHT - 120}
              width={screenWidth - 40}
              style={styles.zoomSvg}
            >
              {/* Paths del zoom */}
              {zoomPaths.map((pathData, index) => (
                <Path
                  key={`zoom-${index}`}
                  d={pathData.path}
                  stroke={pathData.color}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              
              {/* Path actual siendo dibujado */}
              {currentPath && (
                <Path
                  d={currentPath}
                  stroke="#000000"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
            
            <View style={styles.statusOverlay}>
              <Text style={styles.statusText}>
                📍 Posición: ({Math.round(selectedArea.x)}, {Math.round(selectedArea.y)})
              </Text>
              <Text style={styles.statusText}>
                🔍 Área: {AREA_SIZE}x{AREA_SIZE}px • Dibuja aquí
              </Text>
            </View>
          </View>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  instructionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedAreaIndicator: {
    position: 'absolute',
    zIndex: 1500,
  },
  areaFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#6D28D9',
    borderRadius: 8,
    backgroundColor: 'rgba(109, 40, 217, 0.1)',
  },
  zoomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ZOOM_AREA_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  panelTitle: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 4,
  },
  closeHeaderButton: {
    padding: 8,
    marginLeft: 8,
  },
  zoomArea: {
    flex: 1,
    margin: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  zoomSvg: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  statusOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    padding: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});
