import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Text
} from 'react-native';
import Svg, { Rect as SvgRect, Circle } from 'react-native-svg';
import { Move, Square } from 'lucide-react-native';
import { ZoomWritingArea } from './ZoomWritingArea';
import { 
  Stroke, 
  Rect, 
  Point,
  clampRectToCanvas,
  getResizeHandles,
  transformStrokeFromCanvasToZoom
} from '@/utils/geometry';

interface AutoAdvanceConfig {
  enabled: boolean;
  direction: 'horizontal' | 'vertical' | 'both';
  thresholdPx: number;
  stepPx: number;
  lineHeightPx?: number;
  wrapToNextLine?: boolean;
}

interface CanvasWithZoomWindowProps {
  // Configuración del canvas principal
  canvasWidth: number;
  canvasHeight: number;
  children: React.ReactNode; // Canvas existente
  
  // Control del rectángulo objetivo
  targetRect: Rect;
  onChangeTargetRect?: (rect: Rect) => void;
  
  // Configuración de la ventana de zoom
  zoomWindowWidth: number;
  zoomWindowHeight: number;
  zoomFactor: number;
  
  // Configuración de entrada y estilos
  pencilOnlyDraw?: boolean;
  allowFingerPan?: boolean;
  
  strokeStyle?: {
    width: number;
    color: string;
    opacity?: number;
    smoothing?: { type: 'oneEuro' | 'catmullRom' | 'none' };
    pressureEnabled?: boolean;
    scaleStrokeToTarget?: boolean;
  };
  
  // Strokes del documento
  strokes: Stroke[];
  onAddStroke?: (stroke: Stroke) => void;
  onUpdateStrokePartial?: (id: string, partial: Partial<Stroke>) => void;
  onCommitStroke?: (id: string) => void;
  onClearArea?: () => void;
  
  // Auto-avance
  autoAdvance?: AutoAdvanceConfig;
  
  // Callbacks
  onBeginDraw?: () => void;
  onEndDraw?: () => void;
  
  // Estados
  isActive: boolean;
  onClose: () => void;
  
  // Nuevo: handler para toques del canvas
  onCanvasTouchHandler?: (handler: (x: number, y: number) => void) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const HANDLE_SIZE = 12;

export const CanvasWithZoomWindow: React.FC<CanvasWithZoomWindowProps> = ({
  canvasWidth,
  canvasHeight,
  children,
  targetRect,
  onChangeTargetRect,
  zoomWindowWidth,
  zoomWindowHeight,
  zoomFactor,
  pencilOnlyDraw = false,
  allowFingerPan = true,
  strokeStyle = {
    width: 2,
    color: '#000000',
    opacity: 1,
    scaleStrokeToTarget: true
  },
  strokes,
  onAddStroke,
  onUpdateStrokePartial,
  onCommitStroke,
  onClearArea,
  autoAdvance,
  onBeginDraw,
  onEndDraw,
  isActive,
  onClose,
  onCanvasTouchHandler
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [showHandles, setShowHandles] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Referencias para touch
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Auto-cerrar las instrucciones después de 3 segundos
  useEffect(() => {
    if (isActive && showInstructions) {
      const instructionTimeout = setTimeout(() => {
        setShowInstructions(false);
      }, 3000);
      
      return () => clearTimeout(instructionTimeout);
    }
  }, [isActive, showInstructions]);

  // Función para permitir seleccionar nueva área
  const handleSelectNewArea = useCallback(() => {
    setShowInstructions(true);
  }, []);

  // Función para manejar toque inicial en el canvas (selección de área)
  const handleCanvasTouch = useCallback((x: number, y: number) => {
    // Solo permitir selección de área si las instrucciones están visibles
    if (showInstructions) {
      // Centrar el rectángulo en la posición tocada
      const newRect = {
        x: Math.max(0, Math.min(canvasWidth - targetRect.width, x - targetRect.width / 2)),
        y: Math.max(0, Math.min(canvasHeight - targetRect.height, y - targetRect.height / 2)),
        width: targetRect.width,
        height: targetRect.height
      };
      
      if (onChangeTargetRect) {
        onChangeTargetRect(newRect);
      }
      
      // Ocultar instrucciones
      setShowInstructions(false);
    }
  }, [showInstructions, canvasWidth, canvasHeight, targetRect, onChangeTargetRect]);

  // Registrar el handler para toques del canvas
  useEffect(() => {
    if (isActive && onCanvasTouchHandler) {
      onCanvasTouchHandler(handleCanvasTouch);
    }
  }, [isActive, onCanvasTouchHandler, handleCanvasTouch]);

  // Filtrar strokes que están dentro del área objetivo
  const getStrokesInTargetArea = useCallback((): Stroke[] => {
    return strokes.filter(stroke => {
      return stroke.points.some(point => 
        point.x >= targetRect.x && point.x <= targetRect.x + targetRect.width &&
        point.y >= targetRect.y && point.y <= targetRect.y + targetRect.height
      );
    });
  }, [strokes, targetRect]);

  // Transformar strokes del canvas a coordenadas de zoom
  const getDisplayStrokesForZoom = useCallback((): Stroke[] => {
    const strokesInArea = getStrokesInTargetArea();
    return strokesInArea
      .map(stroke => transformStrokeFromCanvasToZoom(
        stroke,
        zoomWindowWidth - 40, // descontar padding
        zoomWindowHeight - 140, // descontar header y controles
        targetRect,
        20, // padding
        20
      ))
      .filter((stroke): stroke is Stroke => stroke !== null);
  }, [getStrokesInTargetArea, zoomWindowWidth, zoomWindowHeight, targetRect]);

  // Limpiar strokes del área actual
  const handleClearArea = useCallback(() => {
    if (onClearArea) {
      onClearArea();
    }
  }, [onClearArea]);

  // Mover el rectángulo objetivo
  const moveTargetRect = useCallback((deltaX: number, deltaY: number) => {
    const newRect = {
      ...targetRect,
      x: targetRect.x + deltaX,
      y: targetRect.y + deltaY
    };
    
    const clampedRect = clampRectToCanvas(newRect, canvasWidth, canvasHeight);
    
    if (onChangeTargetRect) {
      onChangeTargetRect(clampedRect);
    }
  }, [targetRect, canvasWidth, canvasHeight, onChangeTargetRect]);

  // PanResponder para el rectángulo objetivo (mover y redimensionar)
  const targetRectPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      // Si las instrucciones están visibles, manejar como selección de área
      if (showInstructions) {
        handleCanvasTouch(locationX, locationY);
        return;
      }
      
      lastTouchRef.current = { x: locationX, y: locationY };
      
      // Verificar si está tocando un handle de redimensionamiento
      const handles = getResizeHandles(targetRect, HANDLE_SIZE);
      let touchedHandle: string | null = null;
      
      Object.entries(handles).forEach(([handleName, handle]) => {
        if (locationX >= handle.x && locationX <= handle.x + handle.width &&
            locationY >= handle.y && locationY <= handle.y + handle.height) {
          touchedHandle = handleName;
        }
      });
      
      if (touchedHandle) {
        setIsResizing(true);
        setResizeHandle(touchedHandle);
      } else if (locationX >= targetRect.x && locationX <= targetRect.x + targetRect.width &&
                 locationY >= targetRect.y && locationY <= targetRect.y + targetRect.height) {
        // Tocando el centro del rectángulo - modo arrastrar
        setIsDragging(true);
        setDragOffset({
          x: locationX - targetRect.x,
          y: locationY - targetRect.y
        });
      }
      
      setShowHandles(true);
    },
    
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      if (isDragging) {
        const newX = locationX - dragOffset.x;
        const newY = locationY - dragOffset.y;
        const newRect = { ...targetRect, x: newX, y: newY };
        const clampedRect = clampRectToCanvas(newRect, canvasWidth, canvasHeight);
        
        if (onChangeTargetRect) {
          onChangeTargetRect(clampedRect);
        }
      } else if (isResizing && lastTouchRef.current) {
        const deltaX = locationX - lastTouchRef.current.x;
        const deltaY = locationY - lastTouchRef.current.y;
        
        let newRect = { ...targetRect };
        
        switch (resizeHandle) {
          case 'bottomRight':
            newRect.width = Math.max(50, targetRect.width + deltaX);
            newRect.height = Math.max(50, targetRect.height + deltaY);
            break;
          case 'topLeft':
            newRect.x = targetRect.x + deltaX;
            newRect.y = targetRect.y + deltaY;
            newRect.width = Math.max(50, targetRect.width - deltaX);
            newRect.height = Math.max(50, targetRect.height - deltaY);
            break;
          case 'topRight':
            newRect.y = targetRect.y + deltaY;
            newRect.width = Math.max(50, targetRect.width + deltaX);
            newRect.height = Math.max(50, targetRect.height - deltaY);
            break;
          case 'bottomLeft':
            newRect.x = targetRect.x + deltaX;
            newRect.width = Math.max(50, targetRect.width - deltaX);
            newRect.height = Math.max(50, targetRect.height + deltaY);
            break;
        }
        
        const clampedRect = clampRectToCanvas(newRect, canvasWidth, canvasHeight);
        if (onChangeTargetRect) {
          onChangeTargetRect(clampedRect);
        }
        
        lastTouchRef.current = { x: locationX, y: locationY };
      }
    },
    
    onPanResponderRelease: () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
      lastTouchRef.current = null;
      
      // Ocultar handles después de un tiempo
      setTimeout(() => {
        setShowHandles(false);
      }, 2000);
    }
  });

  if (!isActive) return null;

  const handles = getResizeHandles(targetRect, HANDLE_SIZE);

  return (
    <View style={styles.container}>
      {/* Overlay de instrucciones */}
      {showInstructions && (
        <View style={styles.instructionOverlay}>
          <View style={styles.instructionCard}>
            <Square size={32} color="#6D28D9" />
            <Text style={styles.instructionTitle}>Área de escritura</Text>
            <Text style={styles.instructionText}>
              Toca el área del canvas donde quieres escribir con precisión
            </Text>
            <Text style={styles.instructionSubText}>
              Esta notificación se cerrará automáticamente
            </Text>
          </View>
        </View>
      )}

      {/* Canvas principal con overlay */}
      <View style={styles.canvasContainer}>
        {children}
        
        {/* Overlay para el rectángulo objetivo */}
        <View style={styles.overlay} {...targetRectPanResponder.panHandlers}>
          <Svg 
            width={canvasWidth} 
            height={canvasHeight}
            style={styles.overlayContent}
          >
            {/* Rectángulo objetivo - solo visible si no se muestran instrucciones */}
            {!showInstructions && (
              <>
                <SvgRect
                  x={targetRect.x}
                  y={targetRect.y}
                  width={targetRect.width}
                  height={targetRect.height}
                  fill="rgba(109, 40, 217, 0.1)"
                  stroke="#6D28D9"
                  strokeWidth={2}
                  strokeDasharray="5,3"
                  rx={8}
                />
                
                {/* Handles de redimensionamiento */}
                {showHandles && Object.entries(handles).map(([handleName, handle]) => (
                  <Circle
                    key={handleName}
                    cx={handle.x + handle.width / 2}
                    cy={handle.y + handle.height / 2}
                    r={6}
                    fill="#FFFFFF"
                    stroke="#6D28D9"
                    strokeWidth={2}
                  />
                ))}
                
                {/* Indicador central */}
                <Circle
                  cx={targetRect.x + targetRect.width / 2}
                  cy={targetRect.y + targetRect.height / 2}
                  r={3}
                  fill="#6D28D9"
                />
              </>
            )}
          </Svg>
        </View>
      </View>
      
      {/* Ventana de zoom inferior - solo visible si no hay instrucciones */}
      {!showInstructions && (
        <View style={styles.zoomContainer}>
          <ZoomWritingArea
            width={zoomWindowWidth}
            height={zoomWindowHeight}
            targetRect={targetRect}
            zoomFactor={zoomFactor}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            strokeStyle={strokeStyle}
            displayStrokes={getDisplayStrokesForZoom()}
            onAddStroke={onAddStroke}
            onStrokeUpdate={(strokeId: string, points: Point[]) => {
              if (onUpdateStrokePartial) {
                onUpdateStrokePartial(strokeId, { points });
              }
            }}
            onStrokeComplete={onCommitStroke}
            onClear={handleClearArea}
            onClose={onClose}
            onNewArea={handleSelectNewArea}
            pencilOnlyDraw={pencilOnlyDraw}
            showGrid={true}
            padding={20}
          />
        </View>
      )}
      
      {/* Información del área - solo visible si no hay instrucciones */}
      {!showInstructions && (
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Square size={16} color="#6D28D9" />
            <Text style={styles.infoText}>
              Toca y arrastra para mover • Usa las esquinas para redimensionar
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Move size={16} color="#6B7280" />
            <Text style={styles.infoText}>
              Dibuja abajo y se replica arriba automáticamente
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  instructionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
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
  canvasContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayContent: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  zoomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2000,
  },
  infoContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxWidth: 280,
    zIndex: 1500,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
});
