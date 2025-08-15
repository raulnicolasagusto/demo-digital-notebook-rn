import React, { useMemo, useCallback, memo } from 'react';
import { View, StyleSheet } from 'react-native';

interface CanvasPerformanceOptimizerProps {
  children: React.ReactNode;
  pathsLength?: number;
  textElementsLength?: number;
  zoomLevel?: number;
}

/**
 * Componente optimizador para mejorar el rendimiento del canvas
 * - Memo para evitar re-renders innecesarios
 * - Rendering condicional basado en zoom
 * - Optimización para muchos elementos
 */
export const CanvasPerformanceOptimizer: React.FC<CanvasPerformanceOptimizerProps> = memo(({
  children,
  pathsLength = 0,
  textElementsLength = 0,
  zoomLevel = 1,
}) => {
  // Determinar si necesitamos optimización
  const needsOptimization = useMemo(() => {
    const totalElements = pathsLength + textElementsLength;
    return totalElements > 50; // Umbral para activar optimización
  }, [pathsLength, textElementsLength]);
  
  // Nivel de detalle basado en zoom
  const levelOfDetail = useMemo(() => {
    if (zoomLevel < 0.5) return 'low';    // Zoom muy pequeño
    if (zoomLevel < 1.0) return 'medium'; // Zoom medio
    return 'high';                        // Zoom normal o alto
  }, [zoomLevel]);
  
  // Renderizado optimizado
  const optimizedRendering = useCallback(() => {
    if (!needsOptimization) {
      return children; // Sin optimización necesaria
    }
    
    // Para zoom muy bajo, simplificar el rendering
    if (levelOfDetail === 'low') {
      return (
        <View style={styles.lowDetailContainer}>
          {children}
        </View>
      );
    }
    
    return children;
  }, [children, needsOptimization, levelOfDetail]);
  
  return (
    <View style={styles.container}>
      {optimizedRendering()}
    </View>
  );
});

CanvasPerformanceOptimizer.displayName = 'CanvasPerformanceOptimizer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lowDetailContainer: {
    flex: 1,
    opacity: 0.8, // Reducir opacity para indicar menor detalle
  },
});

// Hook personalizado para obtener métricas de rendimiento
export const useCanvasPerformance = () => {
  const [metrics, setMetrics] = React.useState({
    renderTime: 0,
    lastUpdate: Date.now(),
    frameRate: 60,
  });
  
  const updateMetrics = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - metrics.lastUpdate;
    
    setMetrics(prev => ({
      renderTime: deltaTime,
      lastUpdate: now,
      frameRate: deltaTime > 0 ? Math.round(1000 / deltaTime) : 60,
    }));
  }, [metrics.lastUpdate]);
  
  return { metrics, updateMetrics };
};

// Configuraciones de optimización
export const CANVAS_OPTIMIZATION_CONFIG = {
  // Umbrales
  HIGH_PERFORMANCE_THRESHOLD: 100, // Número de elementos
  LOW_ZOOM_THRESHOLD: 0.5,         // Nivel de zoom
  
  // Configuraciones de ScrollView
  SCROLL_EVENT_THROTTLE: 16,       // 60fps
  ZOOM_SCALE_LIMITS: {
    min: 0.3,
    max: 3.0,
    default: 1.0,
  },
  
  // Configuraciones de rendering
  SHOULD_RASTERIZE_IOS: true,      // Para iOS
  RENDER_TO_HARDWARE_TEXTURE: true, // Para Android
};
