import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  PanResponder,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import Svg, { Path, Line, Rect as SvgRect } from 'react-native-svg';
import { X, RotateCcw } from 'lucide-react-native';
import { 
  Stroke, 
  Rect, 
  Point, 
  mapPointFromZoomToCanvas, 
  transformStrokeFromZoomToCanvas 
} from '@/utils/geometry';

interface ZoomWritingAreaProps {
  // Configuración del área
  width: number;
  height: number;
  targetRect: Rect;
  zoomFactor: number;
  
  // Canvas principal
  canvasWidth: number;
  canvasHeight: number;
  
  // Estilos y herramientas
  strokeStyle: {
    width: number;
    color: string;
    opacity?: number;
  };
  
  // Strokes para mostrar en la ventana de zoom
  displayStrokes: Stroke[];
  
  // Callbacks
  onAddStroke?: (stroke: Stroke) => void;
  onStrokeUpdate?: (strokeId: string, points: Point[]) => void;
  onStrokeComplete?: (strokeId: string) => void;
  onClear?: () => void;
  onClose?: () => void;
  onNewArea?: () => void; // Nueva función para seleccionar nueva área
  
  // Configuraciones opcionales
  pencilOnlyDraw?: boolean;
  showGrid?: boolean;
  padding?: number;
}

const { width: screenWidth } = Dimensions.get('window');

export const ZoomWritingArea: React.FC<ZoomWritingAreaProps> = ({
  width,
  height,
  targetRect,
  zoomFactor,
  canvasWidth,
  canvasHeight,
  strokeStyle,
  displayStrokes,
  onAddStroke,
  onStrokeUpdate,
  onStrokeComplete,
  onClear,
  onClose,
  onNewArea,
  pencilOnlyDraw = false,
  showGrid = true,
  padding = 20
}) => {
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const strokeIdRef = useRef(0);

  // Dimensiones internas del área de dibujo (descontando padding)
  const drawingWidth = width - 2 * padding;
  const drawingHeight = height - 80; // 80px para header y controles

  // Generar líneas de grid
  const generateGridLines = () => {
    if (!showGrid) return null;
    
    const lines: React.ReactElement[] = [];
    const gridSpacing = 20;
    const opacity = 0.1;
    
    // Líneas verticales
    for (let x = gridSpacing; x < drawingWidth; x += gridSpacing) {
      lines.push(
        <Line
          key={`v-${x}`}
          x1={x + padding}
          y1={padding}
          x2={x + padding}
          y2={drawingHeight + padding}
          stroke="#9CA3AF"
          strokeWidth={0.5}
          opacity={opacity}
        />
      );
    }
    
    // Líneas horizontales
    for (let y = gridSpacing; y < drawingHeight; y += gridSpacing) {
      lines.push(
        <Line
          key={`h-${y}`}
          x1={padding}
          y1={y + padding}
          x2={drawingWidth + padding}
          y2={y + padding}
          stroke="#9CA3AF"
          strokeWidth={0.5}
          opacity={opacity}
        />
      );
    }
    
    return lines;
  };

  // Convertir stroke a path SVG
  const strokeToPath = (stroke: Stroke): string => {
    if (stroke.points.length === 0) return '';
    
    const points = stroke.points;
    let path = `M${points[0].x},${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      path += ` L${points[i].x},${points[i].y}`;
    }
    
    return path;
  };

  // PanResponder para manejar el dibujo
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      
      // Verificar si está dentro del área de dibujo
      if (locationX < padding || locationX > width - padding ||
          locationY < padding || locationY > drawingHeight + padding) {
        return;
      }
      
      // Solo dibujar si no está en modo pencilOnly o si es un stylus
      if (pencilOnlyDraw && evt.nativeEvent.force === undefined) {
        return;
      }
      
      const strokeId = `zoom-stroke-${Date.now()}-${strokeIdRef.current++}`;
      const initialPoint: Point = {
        x: locationX,
        y: locationY,
        t: Date.now(),
        pressure: evt.nativeEvent.force || 0.5
      };
      
      const newStroke: Stroke = {
        id: strokeId,
        points: [initialPoint],
        width: strokeStyle.width,
        color: strokeStyle.color,
        opacity: strokeStyle.opacity || 1,
        tool: 'pen'
      };
      
      setCurrentStroke(newStroke);
      setIsDrawing(true);
      
      // Notificar inicio del stroke al canvas principal
      if (onStrokeUpdate) {
        const canvasPoint = mapPointFromZoomToCanvas(
          locationX, locationY, drawingWidth, drawingHeight, targetRect, padding, padding
        );
        onStrokeUpdate(strokeId, [canvasPoint]);
      }
    },
    
    onPanResponderMove: (evt) => {
      if (!isDrawing || !currentStroke) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      
      // Verificar límites
      if (locationX < padding || locationX > width - padding ||
          locationY < padding || locationY > drawingHeight + padding) {
        return;
      }
      
      const newPoint: Point = {
        x: locationX,
        y: locationY,
        t: Date.now(),
        pressure: evt.nativeEvent.force || 0.5
      };
      
      const updatedStroke = {
        ...currentStroke,
        points: [...currentStroke.points, newPoint]
      };
      
      setCurrentStroke(updatedStroke);
      
      // Notificar actualización del stroke al canvas principal
      if (onStrokeUpdate) {
        const canvasPoints = updatedStroke.points.map(point =>
          mapPointFromZoomToCanvas(
            point.x, point.y, drawingWidth, drawingHeight, targetRect, padding, padding
          )
        );
        onStrokeUpdate(currentStroke.id, canvasPoints);
      }
    },
    
    onPanResponderRelease: () => {
      if (!isDrawing || !currentStroke) return;
      
      setIsDrawing(false);
      
      // Transformar el stroke completo al canvas principal
      const canvasStroke = transformStrokeFromZoomToCanvas(
        currentStroke,
        drawingWidth,
        drawingHeight,
        targetRect,
        padding,
        padding,
        true
      );
      
      // Notificar stroke completado
      if (onAddStroke) {
        onAddStroke(canvasStroke);
      }
      
      if (onStrokeComplete) {
        onStrokeComplete(currentStroke.id);
      }
      
      setCurrentStroke(null);
    }
  });

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Header con controles */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Área de escritura</Text>
          <Text style={styles.zoomInfo}>{zoomFactor.toFixed(1)}x</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={onNewArea}
          >
            <Text style={styles.buttonText}>Nueva</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={onClear}
          >
            <RotateCcw size={16} color="#6B7280" />
            <Text style={styles.buttonText}>Limpiar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={onClose}
          >
            <X size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Área de dibujo */}
      <View 
        style={[styles.drawingArea, { width, height: height - 60 }]}
        {...panResponder.panHandlers}
      >
        <Svg width={width} height={height - 60} style={styles.svg}>
          {/* Fondo del área de dibujo */}
          <SvgRect
            x={padding}
            y={padding}
            width={drawingWidth}
            height={drawingHeight}
            fill="#FFFFFF"
            stroke="#E5E7EB"
            strokeWidth={1}
            rx={8}
          />
          
          {/* Grid de referencia */}
          {generateGridLines()}
          
          {/* Strokes existentes (desde el canvas principal) */}
          {displayStrokes.map((stroke) => (
            <Path
              key={stroke.id}
              d={strokeToPath(stroke)}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              strokeOpacity={stroke.opacity || 1}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          
          {/* Stroke actual siendo dibujado */}
          {currentStroke && (
            <Path
              d={strokeToPath(currentStroke)}
              stroke={currentStroke.color}
              strokeWidth={currentStroke.width}
              strokeOpacity={currentStroke.opacity || 1}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      </View>
      
      {/* Información del área objetivo */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          📍 Canvas: ({Math.round(targetRect.x)}, {Math.round(targetRect.y)}) • 
          📐 Área: {Math.round(targetRect.width)}×{Math.round(targetRect.height)}px
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    height: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  zoomInfo: {
    fontSize: 12,
    color: '#6D28D9',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontWeight: '500',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  buttonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  drawingArea: {
    flex: 1,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  statusText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
});
