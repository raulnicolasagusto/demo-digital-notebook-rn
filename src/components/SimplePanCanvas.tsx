import React from 'react';
import { View, ScrollView } from 'react-native';

interface SimplePanCanvasProps {
  children: React.ReactNode;
  canvasWidth: number;
  canvasHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

// Componente muy simple que solo usa ScrollView nativo
// Para funcionalidad futura de gestos de dos dedos
export const SimplePanCanvas: React.FC<SimplePanCanvasProps> = ({
  children,
  canvasWidth,
  canvasHeight,
  viewportWidth,
  viewportHeight,
}) => {
  return (
    <ScrollView
      style={{
        width: viewportWidth,
        height: viewportHeight,
      }}
      contentContainerStyle={{
        width: canvasWidth,
        height: canvasHeight,
      }}
      maximumZoomScale={3}
      minimumZoomScale={1}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};
