import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface DrawPath {
  path: string;
  color: string;
}

interface PermanentCanvasProps {
  paths: DrawPath[];
  strokeWidth?: number;
}

/**
 * 🚀 FASE 2: Permanent Canvas Layer
 * 
 * Componente optimizado para renderizar solo los trazos permanentes
 * (completados). Usa React.memo para evitar re-renders innecesarios.
 * 
 * Beneficios:
 * - Solo se re-renderiza cuando paths cambian
 * - Separado del trazo temporal actual
 * - Optimizado para dibujos complejos con muchos trazos
 */
export const PermanentCanvas: React.FC<PermanentCanvasProps> = React.memo(({
  paths,
  strokeWidth = 2,
}) => {
  // Optimización: solo renderizar si hay paths
  if (paths.length === 0) return null;
  
  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill}>
        {paths.map((pathData, index) => (
          <Path
            key={`path-${index}`} // Mejor key para performance
            d={pathData.path}
            stroke={pathData.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}, (prevProps, nextProps) => {
  // Comparación personalizada para optimizar re-renders
  return (
    prevProps.paths.length === nextProps.paths.length &&
    prevProps.strokeWidth === nextProps.strokeWidth &&
    prevProps.paths.every((path, index) => 
      path.path === nextProps.paths[index]?.path && 
      path.color === nextProps.paths[index]?.color
    )
  );
});

PermanentCanvas.displayName = 'PermanentCanvas';
