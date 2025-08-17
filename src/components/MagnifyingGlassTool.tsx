import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  PanResponder, 
  Dimensions,
  Alert
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';

interface DrawPath {
  path: string;
  color: string;
}

interface MagnifyingGlassToolProps {
  isActive: boolean;
  onClose: () => void;
  onDrawingUpdate: (paths: DrawPath[]) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasTouchHandler?: (handler: (x: number, y: number) => void) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const DRAWING_AREA_HEIGHT = 200;
const MAGNIFY_SCALE = 2; // Factor de ampliación

export const MagnifyingGlassTool: React.FC<MagnifyingGlassToolProps> = ({
  isActive,
  onClose,
  onDrawingUpdate,
  canvasWidth,
  canvasHeight,
  onCanvasTouchHandler
}) => {
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [drawingPaths, setDrawingPaths] = useState<DrawPath[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  React.useEffect(() => {
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

  // Efecto separado para el panel de dibujo
  React.useEffect(() => {
    if (isActive && selectedArea) {
      Animated.timing(slideAnim, {
        toValue: screenHeight - DRAWING_AREA_HEIGHT,
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
      
      const updatedPaths = [...drawingPaths, newPath];
      setDrawingPaths(updatedPaths);
      
      // Convertir las coordenadas del área de dibujo al canvas principal
      const scaledPaths = convertDrawingToCanvasPaths(updatedPaths, selectedArea);
      onDrawingUpdate(scaledPaths);
      
      setCurrentPath('');
      setIsDrawing(false);
    },
  });

  const convertDrawingToCanvasPaths = (paths: DrawPath[], area: { x: number; y: number }): DrawPath[] => {
    return paths.map(pathData => {
      // Convertir directamente las coordenadas del panel a coordenadas absolutas del canvas
      const scaledPath = pathData.path
        .replace(/M(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          // Coordenadas absolutas del canvas basadas en donde tocó el usuario
          const canvasX = area.x + (parseFloat(x) * 0.2); // Factor de escala para hacer más preciso
          const canvasY = area.y + (parseFloat(y) * 0.2);
          return `M${canvasX},${canvasY}`;
        })
        .replace(/L(\d+\.?\d*),(\d+\.?\d*)/g, (match, x, y) => {
          // Coordenadas absolutas del canvas basadas en donde tocó el usuario  
          const canvasX = area.x + (parseFloat(x) * 0.2); // Factor de escala para hacer más preciso
          const canvasY = area.y + (parseFloat(y) * 0.2);
          return `L${canvasX},${canvasY}`;
        });
      
      
      return {
        ...pathData,
        path: scaledPath
      };
    });
  };

  const clearDrawing = () => {
    setDrawingPaths([]);
    onDrawingUpdate([]);
  };

  const selectNewArea = () => {
    setSelectedArea(null);
    setShowInstructions(true);
    clearDrawing();
  };

  if (!isActive) return null;

  return (
    <>
      {/* Overlay de instrucciones */}
      {showInstructions && (
        <View style={styles.instructionOverlay}>
          <View style={styles.instructionCard}>
            <Search size={32} color="#6D28D9" />
            <Text style={styles.instructionTitle}>Lupa de Dibujo</Text>
            <Text style={styles.instructionText}>
              Toca el área del canvas donde quieres dibujar con precisión
            </Text>
            <Text style={styles.instructionSubText}>
              Esta notificación se cerrará automáticamente
            </Text>
          </View>
        </View>
      )}

      {/* Indicador de área seleccionada */}
      {selectedArea && (
        <View 
          style={[
            styles.selectedAreaIndicator,
            {
              left: selectedArea.x - 25,
              top: selectedArea.y - 25,
            }
          ]}
        >
          <Svg width="50" height="50">
            <Circle cx="25" cy="25" r="20" stroke="#6D28D9" strokeWidth="2" fill="none" />
          </Svg>
        </View>
      )}

      {/* Panel de dibujo inferior */}
      {selectedArea && (
        <Animated.View 
          style={[
            styles.drawingPanel,
            { transform: [{ translateY: slideAnim }] }
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.panelHeader}>
            <View style={styles.headerLeft}>
              <Search size={20} color="#6D28D9" />
              <Text style={styles.panelTitle}>
                {selectedArea ? 'Dibuja aquí - se reflejará en el canvas' : 'Selecciona un área primero'}
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={selectNewArea}>
                <Text style={styles.headerButtonText}>Nueva Área</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={clearDrawing}>
                <Text style={styles.headerButtonText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeHeaderButton} onPress={onClose}>
                <X size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.drawingArea}>
            <Svg
              height={DRAWING_AREA_HEIGHT - 60}
              width={screenWidth - 20}
              style={styles.drawingSvg}
            >
              {/* Paths guardados */}
              {drawingPaths.map((pathData, index) => (
                <Path
                  key={index}
                  d={pathData.path}
                  stroke={pathData.color}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              
              {/* Path actual */}
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
            
            {!selectedArea && (
              <View style={styles.disabledOverlay}>
                <Text style={styles.disabledText}>
                  Selecciona un área en el canvas primero
                </Text>
              </View>
            )}
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
    position: 'relative',
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
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  selectedAreaIndicator: {
    position: 'absolute',
    width: 50,
    height: 50,
    zIndex: 1500,
  },
  drawingPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: DRAWING_AREA_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
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
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginLeft: 8,
  },
  headerButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  closeHeaderButton: {
    padding: 8,
    marginLeft: 8,
  },
  drawingArea: {
    flex: 1,
    margin: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    position: 'relative',
  },
  drawingSvg: {
    backgroundColor: 'transparent',
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
