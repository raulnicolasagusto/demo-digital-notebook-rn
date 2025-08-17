import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  PanResponder, 
  Dimensions,
  ScrollView
} from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { X, RotateCcw, Target, ZoomIn, Move } from 'lucide-react-native';

interface DrawPath {
  path: string;
  color: string;
}

interface ZoomWindowProps {
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
const ZOOM_SCALE = 3; // Factor de amplificación 3x
const AREA_SIZE = 120; // Tamaño del área capturada en píxeles del canvas

export const ZoomWindow: React.FC<ZoomWindowProps> = ({
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

  // Sincronizar con los paths del canvas cuando se selecciona un área
  useEffect(() => {
    if (selectedArea && canvasPaths && canvasPaths.length > 0) {
      const areaLeftX = selectedArea.x - AREA_SIZE / 2;
      const areaTopY = selectedArea.y - AREA_SIZE / 2;
      const areaRightX = selectedArea.x + AREA_SIZE / 2;
      const areaBottomY = selectedArea.y + AREA_SIZE / 2;

      // Filtrar paths que están dentro del área seleccionada
      const pathsInArea = canvasPaths
        .map(pathData => {
          if (!pathData || !pathData.path) return null;
          const newPath = convertCanvasPathToZoomPath(pathData.path, areaLeftX, areaTopY);
          return newPath ? { ...pathData, path: newPath } : null;
        })
        .filter((path): path is DrawPath => path !== null);

      setZoomPaths(pathsInArea);
    } else if (selectedArea) {
      // Si no hay paths o el área cambió, limpiar
      setZoomPaths([]);
    }
  }, [selectedArea, canvasPaths]);

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
      if (canvasPath) {
        const allCanvasPaths = [...canvasPaths, canvasPath];
        onDrawingUpdate(allCanvasPaths);
      }
      
      setCurrentPath('');
      setIsDrawing(false);
    },
  });

  // Convierte un path del canvas a coordenadas del zoom window
  const convertCanvasPathToZoomPath = (canvasPath: string, areaX: number, areaY: number): string | null => {
    if (!canvasPath || typeof canvasPath !== 'string') return null;
    
    let hasValidPoints = false;
    const zoomWidth = screenWidth - 20;
    const zoomHeight = ZOOM_AREA_HEIGHT - 80;

    try {
      const convertedPath = canvasPath
        .replace(/M(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const canvasX = parseFloat(x);
          const canvasY = parseFloat(y);
          
          if (isNaN(canvasX) || isNaN(canvasY)) return match;
          
          // Verificar si el punto está dentro del área
          if (canvasX >= areaX && canvasX <= areaX + AREA_SIZE && 
              canvasY >= areaY && canvasY <= areaY + AREA_SIZE) {
            hasValidPoints = true;
            const zoomX = (canvasX - areaX) * (zoomWidth / AREA_SIZE);
            const zoomY = (canvasY - areaY) * (zoomHeight / AREA_SIZE);
            return `M${zoomX},${zoomY}`;
          }
          return match;
        })
        .replace(/L(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const canvasX = parseFloat(x);
          const canvasY = parseFloat(y);
          
          if (isNaN(canvasX) || isNaN(canvasY)) return match;
          
          // Verificar si el punto está dentro del área
          if (canvasX >= areaX && canvasX <= areaX + AREA_SIZE && 
              canvasY >= areaY && canvasY <= areaY + AREA_SIZE) {
            hasValidPoints = true;
            const zoomX = (canvasX - areaX) * (zoomWidth / AREA_SIZE);
            const zoomY = (canvasY - areaY) * (zoomHeight / AREA_SIZE);
            return `L${zoomX},${zoomY}`;
          }
          return match;
        });

      return hasValidPoints ? convertedPath : null;
    } catch (error) {
      console.error('Error converting canvas path to zoom path:', error);
      return null;
    }
  };

  // Convierte un path del zoom window a coordenadas del canvas
  const convertZoomPathToCanvasPath = (zoomPath: DrawPath, area: { x: number; y: number }): DrawPath | null => {
    if (!zoomPath || !zoomPath.path || !area) return null;
    
    try {
      const areaLeftX = area.x - AREA_SIZE / 2;
      const areaTopY = area.y - AREA_SIZE / 2;
      const zoomWidth = screenWidth - 20;
      const zoomHeight = ZOOM_AREA_HEIGHT - 80;

      const canvasPath = zoomPath.path
        .replace(/M(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const zoomX = parseFloat(x);
          const zoomY = parseFloat(y);
          
          if (isNaN(zoomX) || isNaN(zoomY)) return match;
          
          const canvasX = areaLeftX + (zoomX * AREA_SIZE / zoomWidth);
          const canvasY = areaTopY + (zoomY * AREA_SIZE / zoomHeight);
          
          return `M${canvasX},${canvasY}`;
        })
        .replace(/L(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const zoomX = parseFloat(x);
          const zoomY = parseFloat(y);
          
          if (isNaN(zoomX) || isNaN(zoomY)) return match;
          
          const canvasX = areaLeftX + (zoomX * AREA_SIZE / zoomWidth);
          const canvasY = areaTopY + (zoomY * AREA_SIZE / zoomHeight);
          
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
    setZoomPaths([]);
  };

  if (!isActive) return null;

  const zoomWidth = screenWidth - 20;
  const zoomHeight = ZOOM_AREA_HEIGHT - 80;

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
            <Text style={styles.instructionSubText}>
              Se abrirá una ventana amplificada para dibujar
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
          <View style={styles.centerCross} />
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
              <Text style={styles.panelTitle}>Área de Escritura - {ZOOM_SCALE}x</Text>
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
              height={zoomHeight}
              width={zoomWidth}
              style={styles.zoomSvg}
            >
              {/* Fondo simple */}
              <Rect 
                width="100%" 
                height="100%" 
                fill="#FAFAFA" 
                stroke="#E5E7EB" 
                strokeWidth="1" 
              />

              {/* Paths sincronizados del canvas */}
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
          </View>

          <View style={styles.statusBar}>
            <Text style={styles.statusText}>
              📍 Posición: ({Math.round(selectedArea.x)}, {Math.round(selectedArea.y)})
            </Text>
            <Text style={styles.statusText}>
              🔍 Zoom: {ZOOM_SCALE}x • Área: {AREA_SIZE}x{AREA_SIZE}px
            </Text>
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
  instructionSubText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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
  centerCross: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    marginTop: -10,
    marginLeft: -10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#6D28D9',
    backgroundColor: '#FFFFFF',
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
    overflow: 'hidden',
  },
  zoomSvg: {
    backgroundColor: 'transparent',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
});
