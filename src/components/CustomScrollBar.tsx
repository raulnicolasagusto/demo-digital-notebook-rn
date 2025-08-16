import React, { useState } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';

interface CustomScrollBarProps {
  isHorizontal: boolean;
  canvasSize: number;      // Ancho o alto del canvas
  viewportSize: number;    // Ancho o alto del viewport
  scrollOffset: number;    // Offset actual del scroll
  onScroll: (offset: number) => void;
}

export const CustomScrollBar: React.FC<CustomScrollBarProps> = ({
  isHorizontal,
  canvasSize,
  viewportSize,
  scrollOffset,
  onScroll,
}) => {
  const [thumbPosition, setThumbPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Calcular el tamaño de la barra thumb basado en la proporción
  const scrollRatio = viewportSize / canvasSize;
  const thumbSize = 25; // Tamaño fijo de 25px para puntos circulares
  const trackSize = isHorizontal ? 200 : 150;
  const maxThumbPosition = trackSize - thumbSize;
  
  // Actualizar posición basada en scroll externo
  React.useEffect(() => {
    if (!isDragging) {
      const maxScroll = canvasSize - viewportSize;
      const newPosition = maxScroll > 0 ? (scrollOffset / maxScroll) * maxThumbPosition : 0;
      const clampedPosition = Math.max(0, Math.min(newPosition, maxThumbPosition));
      setThumbPosition(clampedPosition);
    }
  }, [scrollOffset, canvasSize, viewportSize, maxThumbPosition, isDragging]);
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    
    onPanResponderGrant: () => {
      setIsDragging(true);
    },
    
    onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const translation = isHorizontal ? gestureState.dx : gestureState.dy;
      const newPosition = Math.max(0, Math.min(thumbPosition + translation, maxThumbPosition));
      setThumbPosition(newPosition);
      
      // Calcular el nuevo offset del scroll
      const scrollRatio = newPosition / maxThumbPosition;
      const maxScroll = canvasSize - viewportSize;
      const newOffset = scrollRatio * maxScroll;
      
      onScroll(Math.max(0, newOffset));
    },
    
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });
  
  const containerStyle = isHorizontal ? styles.horizontalContainer : styles.verticalContainer;
  const trackStyle = isHorizontal ? styles.horizontalTrack : styles.verticalTrack;
  const thumbStyle = isHorizontal 
    ? [styles.horizontalThumb, { width: thumbSize, transform: [{ translateX: thumbPosition }] }] 
    : [styles.verticalThumb, { height: thumbSize, transform: [{ translateY: thumbPosition }] }];
  
  return (
    <View style={containerStyle}>
      <View style={trackStyle}>
        <View style={thumbStyle} {...panResponder.panHandlers} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Contenedor horizontal (arriba) - PEGADO AL BORDE
  horizontalContainer: {
    position: 'absolute',
    top: 0,
    left: 20, // Comienza donde termina la barra vertical
    right: 0, // Se extiende hasta el borde derecho
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  
  // Contenedor vertical (izquierda) - PEGADO AL BORDE
  verticalContainer: {
    position: 'absolute',
    left: 0,
    top: 20, // Comienza donde termina la barra horizontal
    bottom: 0, // Se extiende hasta el borde inferior
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
  },
  
  // Track horizontal
  horizontalTrack: {
    width: 200,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    position: 'relative',
  },
  
  // Track vertical
  verticalTrack: {
    width: 8,
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    position: 'relative',
  },
  
  // Thumb horizontal
  horizontalThumb: {
    position: 'absolute',
    height: 20,
    width: 20,
    backgroundColor: '#2563EB',
    borderRadius: 10, // Hace que sea completamente redondo
    top: -4, // Centrar verticalmente en el track
  },
  
  // Thumb vertical
  verticalThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#2563EB',
    borderRadius: 10, // Hace que sea completamente redondo
    left: -6, // Centrar horizontalmente en el track
  },
});
