import React, { useState, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { CanvasPerformanceOptimizer } from './CanvasPerformanceOptimizer';
import { CustomScrollBar } from './CustomScrollBar';
import { PressHoldCanvas } from './PressHoldCanvas';

interface ResponsiveCanvasProps {
  children: React.ReactNode;
  pathsLength?: number;        // Para optimización de rendimiento
  textElementsLength?: number; // Para optimización de rendimiento
}

export const ResponsiveCanvas: React.FC<ResponsiveCanvasProps> = ({ 
  children, 
  pathsLength = 0, 
  textElementsLength = 0 
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Nuevo tamaño del canvas para tablets modernas 1920x1200
  const CANVAS_WIDTH = 960;   // Tablets modernas
  const CANVAS_HEIGHT = 1200;   // Tablets modernas
  
  // Breakpoints actualizados
  const isModernTablet = screenWidth >= 1280; // Tablets modernas 1280x800 o más grandes
  const needsScrollBars = screenWidth < 1280; // Dispositivos más pequeños necesitan scroll
  
  // Estados para el desplazamiento
  const [scrollX, setScrollX] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  
  // Handlers para las barras de scroll personalizadas
  const handleHorizontalScroll = useCallback((offset: number) => {
    setScrollX(offset);
  }, []);
  
  const handleVerticalScroll = useCallback((offset: number) => {
    setScrollY(offset);
  }, []);

  // Handler para cambios de scroll desde PressHoldCanvas
  const handlePressHoldScroll = useCallback((newScrollX: number, newScrollY: number) => {
    setScrollX(newScrollX);
    setScrollY(newScrollY);
  }, []);  // Para tablets modernas (≥1280px): Canvas directo sin barras
  if (isModernTablet) {
    const availableWidth = screenWidth - 40;
    const availableHeight = screenHeight - 140;
    
    // Calcular escala manteniendo proporción
    const scale = Math.min(
      availableWidth / CANVAS_WIDTH,
      availableHeight / CANVAS_HEIGHT,
      1.0 // No agrandar más del tamaño original
    );
    
    const finalWidth = CANVAS_WIDTH * scale;
    const finalHeight = CANVAS_HEIGHT * scale;
    
    return (
      <View style={styles.modernTabletContainer}>
        <View style={[
          styles.canvasContainer,
          {
            width: finalWidth,
            height: finalHeight,
          }
        ]}>
          <View style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: [{ scale: scale }],
            transformOrigin: 'top left',
          }}>
            <CanvasPerformanceOptimizer
              pathsLength={pathsLength}
              textElementsLength={textElementsLength}
              zoomLevel={1}
            >
              {children}
            </CanvasPerformanceOptimizer>
          </View>
        </View>
      </View>
    );
  }
  
  // Para dispositivos más pequeños: Sistema con barras de scroll y ScrollView nativo
  const viewportWidth = screenWidth - 20;  // 20px para barra vertical
  const viewportHeight = screenHeight - 120; // 20px para barra horizontal + header
  
  return (
    <View style={styles.smallDeviceContainer}>
      {/* Barra de scroll horizontal (arriba) */}
      <CustomScrollBar
        isHorizontal={true}
        canvasSize={CANVAS_WIDTH}
        viewportSize={viewportWidth}
        scrollOffset={scrollX}
        onScroll={handleHorizontalScroll}
      />
      
      {/* Barra de scroll vertical (izquierda) */}
      <CustomScrollBar
        isHorizontal={false}
        canvasSize={CANVAS_HEIGHT}
        viewportSize={viewportHeight}
        scrollOffset={scrollY}
        onScroll={handleVerticalScroll}
      />
      
      {/* Área del canvas con ScrollView simple */}
      <View style={[
        styles.canvasViewport,
        {
          width: viewportWidth,
          height: viewportHeight,
          marginLeft: 20,
          marginTop: 20,
        }
      ]}>
        <PressHoldCanvas
          canvasWidth={CANVAS_WIDTH}
          canvasHeight={CANVAS_HEIGHT}
          viewportWidth={viewportWidth}
          viewportHeight={viewportHeight}
          scrollX={scrollX}
          scrollY={scrollY}
          onScrollChange={handlePressHoldScroll}
        >
          <View style={[
            styles.canvasContainer,
            {
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
            }
          ]}>
            <CanvasPerformanceOptimizer
              pathsLength={pathsLength}
              textElementsLength={textElementsLength}
              zoomLevel={1}
            >
              {children}
            </CanvasPerformanceOptimizer>
          </View>
        </PressHoldCanvas>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Tablets modernas (≥1280px): Sin barras de scroll
  modernTabletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  
  // Dispositivos más pequeños (<1280px): Con barras de scroll
  smallDeviceContainer: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  
  // Viewport del canvas (área visible)
  canvasViewport: {
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  
  // Contenedor del canvas
  canvasContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
});
