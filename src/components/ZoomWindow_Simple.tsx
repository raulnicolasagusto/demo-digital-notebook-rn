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
  // Nuevas props para posicionamiento correcto
  isTablet?: boolean;
  scrollPosition?: { x: number; y: number };
  canvasViewInfo?: {
    containerWidth: number;
    containerHeight: number;
    canvasDisplayWidth: number;
    canvasDisplayHeight: number;
    scale: number;
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ZOOM_AREA_HEIGHT = 280;
const AREA_SIZE = 120; // Tamaño del área capturada en el canvas
const ZOOM_SCALE = 3; // Factor de amplificación 3x como GoodNotes

export const ZoomWindowSimple: React.FC<ZoomWindowSimpleProps> = ({
  isActive,
  onClose,
  onDrawingUpdate,
  canvasWidth,
  canvasHeight,
  canvasPaths,
  canvasScale,
  canvasOffset,
  onCanvasTouchHandler,
  isTablet = false,
  scrollPosition = { x: 0, y: 0 },
  canvasViewInfo
}) => {
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [zoomPaths, setZoomPaths] = useState<DrawPath[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  // Estado para el recuadro guía que siempre se muestra
  const [guideRect, setGuideRect] = useState<{ x: number; y: number } | null>({ x: canvasWidth / 2, y: canvasHeight / 2 });

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    // Siempre registrar el handler para toques del canvas (para el recuadro guía)
    if (onCanvasTouchHandler) {
      onCanvasTouchHandler(handleCanvasTouch);
    }
    
    if (isActive) {
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

  // SINCRONIZACIÓN BIDIRECCIONAL: Canvas → Zoom Window
  useEffect(() => {
    if (selectedArea && canvasPaths && canvasPaths.length > 0) {
      const areaLeftX = selectedArea.x - AREA_SIZE / 2;
      const areaTopY = selectedArea.y - AREA_SIZE / 2;
      const areaRightX = selectedArea.x + AREA_SIZE / 2;
      const areaBottomY = selectedArea.y + AREA_SIZE / 2;

      // Filtrar y convertir paths que están dentro del área seleccionada
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
    // Siempre actualizar el recuadro guía, sin importar el estado
    setGuideRect({ x, y });
    
    // Si el modo lupa está activo, actualizar el área seleccionada
    if (isActive) {
      setSelectedArea({ x, y });
      setShowInstructions(false);
    }
  };

  // CONVERSIÓN Canvas → Zoom Window (para mostrar trazos existentes)
  const convertCanvasPathToZoomPath = (canvasPath: string, areaX: number, areaY: number): string | null => {
    if (!canvasPath || typeof canvasPath !== 'string') return null;
    
    let hasValidPoints = false;
    const zoomAreaWidth = screenWidth - 40; // Área de dibujo del zoom
    const zoomAreaHeight = ZOOM_AREA_HEIGHT - 120;

    try {
      const convertedPath = canvasPath
        .replace(/M(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const canvasX = parseFloat(x);
          const canvasY = parseFloat(y);
          
          if (isNaN(canvasX) || isNaN(canvasY)) return match;
          
          // Verificar si el punto está dentro del área seleccionada
          if (canvasX >= areaX && canvasX <= areaX + AREA_SIZE && 
              canvasY >= areaY && canvasY <= areaY + AREA_SIZE) {
            hasValidPoints = true;
            // Convertir coordenadas del canvas al zoom window (amplificar 3x)
            const zoomX = (canvasX - areaX) * ZOOM_SCALE;
            const zoomY = (canvasY - areaY) * ZOOM_SCALE;
            return `M${zoomX},${zoomY}`;
          }
          return match;
        })
        .replace(/L(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const canvasX = parseFloat(x);
          const canvasY = parseFloat(y);
          
          if (isNaN(canvasX) || isNaN(canvasY)) return match;
          
          // Verificar si el punto está dentro del área seleccionada
          if (canvasX >= areaX && canvasX <= areaX + AREA_SIZE && 
              canvasY >= areaY && canvasY <= areaY + AREA_SIZE) {
            hasValidPoints = true;
            // Convertir coordenadas del canvas al zoom window (amplificar 3x)
            const zoomX = (canvasX - areaX) * ZOOM_SCALE;
            const zoomY = (canvasY - areaY) * ZOOM_SCALE;
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

  // CONVERSIÓN Zoom Window → Canvas (para dibujar en el canvas original)
  const convertZoomPathToCanvasPath = (zoomPath: DrawPath, area: { x: number; y: number }): DrawPath | null => {
    if (!zoomPath || !zoomPath.path || !area) return null;
    
    try {
      const areaLeftX = area.x - AREA_SIZE / 2;
      const areaTopY = area.y - AREA_SIZE / 2;

      const canvasPath = zoomPath.path
        .replace(/M(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const zoomX = parseFloat(x);
          const zoomY = parseFloat(y);
          
          if (isNaN(zoomX) || isNaN(zoomY)) return match;
          
          // Convertir de coordenadas del zoom al canvas (reducir de 3x a 1x)
          const canvasX = areaLeftX + (zoomX / ZOOM_SCALE);
          const canvasY = areaTopY + (zoomY / ZOOM_SCALE);
          
          return `M${canvasX},${canvasY}`;
        })
        .replace(/L(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          const zoomX = parseFloat(x);
          const zoomY = parseFloat(y);
          
          if (isNaN(zoomX) || isNaN(zoomY)) return match;
          
          // Convertir de coordenadas del zoom al canvas (reducir de 3x a 1x)
          const canvasX = areaLeftX + (zoomX / ZOOM_SCALE);
          const canvasY = areaTopY + (zoomY / ZOOM_SCALE);
          
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

  // Calcular la posición del indicador considerando escala y scroll
  const getIndicatorPosition = () => {
    if (!selectedArea) return { left: 0, top: 0 };
    
    if (isTablet && canvasViewInfo) {
      // Para tablets: considerar escala y centrado
      const { containerWidth, containerHeight, canvasDisplayWidth, canvasDisplayHeight, scale } = canvasViewInfo;
      const containerOffsetX = (containerWidth - canvasDisplayWidth) / 2;
      const containerOffsetY = (containerHeight - canvasDisplayHeight) / 2;
      
      const displayX = (selectedArea.x * scale) + containerOffsetX;
      const displayY = (selectedArea.y * scale) + containerOffsetY;
      
      return {
        left: displayX - (AREA_SIZE * scale) / 2,
        top: displayY - (AREA_SIZE * scale) / 2,
      };
    } else {
      // Para dispositivos pequeños: considerar scroll
      const displayX = selectedArea.x - scrollPosition.x;
      const displayY = selectedArea.y - scrollPosition.y;
      
      return {
        left: displayX - AREA_SIZE / 2,
        top: displayY - AREA_SIZE / 2,
      };
    }
  };

  // Calcular el tamaño del indicador considerando escala
  const getIndicatorSize = () => {
    if (isTablet && canvasViewInfo) {
      const scaledSize = AREA_SIZE * canvasViewInfo.scale;
      return { width: scaledSize, height: scaledSize };
    }
    return { width: AREA_SIZE, height: AREA_SIZE };
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

      {/* Indicador de área que siempre se muestra */}
      {guideRect && (
        <View 
          style={[
            styles.selectedAreaIndicator,
            {
              left: guideRect.x - AREA_SIZE / 2,
              top: guideRect.y - AREA_SIZE / 2,
              width: AREA_SIZE,
              height: AREA_SIZE,
            }
          ]}
        >
          <View style={[styles.areaFrame, isActive && selectedArea ? {} : styles.guideFrame]} />
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
              {/* Paths sincronizados del canvas (amplificados 3x) */}
              {zoomPaths.map((pathData, index) => (
                <Path
                  key={`zoom-${index}`}
                  d={pathData.path}
                  stroke={pathData.color}
                  strokeWidth="2" // Más fino en el zoom
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
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
            
            {/* Grid visual para referencia */}
            <View style={styles.gridOverlay}>
              {/* Líneas verticales cada 30px (10px en canvas real) */}
              {Array.from({ length: Math.floor((screenWidth - 40) / 30) }).map((_, i) => (
                <View key={`v-${i}`} style={[styles.gridLine, styles.verticalLine, { left: i * 30 }]} />
              ))}
              {/* Líneas horizontales cada 30px (10px en canvas real) */}
              {Array.from({ length: Math.floor((ZOOM_AREA_HEIGHT - 120) / 30) }).map((_, i) => (
                <View key={`h-${i}`} style={[styles.gridLine, styles.horizontalLine, { top: i * 30 }]} />
              ))}
            </View>
            
            <View style={styles.statusOverlay}>
              <Text style={styles.statusText}>
                📍 Canvas: ({Math.round(selectedArea.x)}, {Math.round(selectedArea.y)})
              </Text>
              <Text style={styles.statusText}>
                🔍 Zoom: {ZOOM_SCALE}x • Área: {AREA_SIZE}x{AREA_SIZE}px • Dibuja aquí
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
  guideFrame: {
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 6,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(156, 163, 175, 0.05)',
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
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none', // No interfiere con el dibujo
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#E5E7EB',
    opacity: 0.3,
  },
  verticalLine: {
    width: 1,
    height: '100%',
  },
  horizontalLine: {
    height: 1,
    width: '100%',
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
