import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TemporalCanvasProps {
  currentPath: string;
  strokeColor?: string;
  strokeWidth?: number;
}

/**
 * 🚀 FASE 2: Temporal Canvas Layer
 * 
 * Componente optimizado para renderizar solo el trazo actual
 * mientras se está dibujando, separado de los trazos permanentes.
 * 
 * Beneficios:
 * - Rendering más rápido para trazo actual
 * - Los trazos permanentes no se re-renderizan
 * - Mejor performance en dibujos complejos
 */
export const TemporalCanvas: React.FC<TemporalCanvasProps> = React.memo(({
  currentPath,
  strokeColor = '#000000',
  strokeWidth = 2,
}) => {
  // Solo renderizar si hay un path actual
  if (!currentPath) return null;
  
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill}>
        <Path
          d={currentPath}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </View>
  );
});

TemporalCanvas.displayName = 'TemporalCanvas';
