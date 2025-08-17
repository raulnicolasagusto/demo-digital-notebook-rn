import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

interface PanGestureCanvasProps {
  children: React.ReactNode;
  canvasWidth: number;
  canvasHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  scrollX: number;
  scrollY: number;
  onScrollChange: (scrollX: number, scrollY: number) => void;
}

export const PanGestureCanvas: React.FC<PanGestureCanvasProps> = ({
  children,
  canvasWidth,
  canvasHeight,
  viewportWidth,
  viewportHeight,
  scrollX,
  scrollY,
  onScrollChange,
}) => {
  const translateX = useSharedValue(-scrollX);
  const translateY = useSharedValue(-scrollY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  
  // Calcular los límites del scroll
  const maxScrollX = Math.max(0, canvasWidth - viewportWidth);
  const maxScrollY = Math.max(0, canvasHeight - viewportHeight);

  // Sincronizar con cambios externos del scroll (barras de scroll)
  useEffect(() => {
    translateX.value = -scrollX;
    translateY.value = -scrollY;
  }, [scrollX, scrollY]);

  // Función para actualizar el scroll en el componente padre
  const updateParentScroll = (newScrollX: number, newScrollY: number) => {
    onScrollChange(newScrollX, newScrollY);
  };

  // Gesto de pan que solo funciona con 2 dedos
  const panGesture = Gesture.Pan()
    .minPointers(2) // Requiere exactamente 2 dedos
    .maxPointers(2) // Máximo 2 dedos
    .onBegin(() => {
      // Guardar la posición inicial
      startX.value = scrollX;
      startY.value = scrollY;
    })
    .onUpdate((event) => {
      // Calcular nueva posición basada en la posición inicial + el movimiento
      const newScrollX = startX.value - event.translationX;
      const newScrollY = startY.value - event.translationY;
      
      // Aplicar límites
      const clampedScrollX = Math.max(0, Math.min(newScrollX, maxScrollX));
      const clampedScrollY = Math.max(0, Math.min(newScrollY, maxScrollY));
      
      // Actualizar valores animados
      translateX.value = -clampedScrollX;
      translateY.value = -clampedScrollY;
      
      // Actualizar el scroll en el componente padre
      runOnJS(updateParentScroll)(clampedScrollX, clampedScrollY);
    });

  // Estilo animado para el contenedor del canvas
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={{ 
        width: viewportWidth, 
        height: viewportHeight, 
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
      }}>
        <Animated.View
          style={[
            {
              width: canvasWidth,
              height: canvasHeight,
            },
            animatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </View>
    </GestureDetector>
  );
};
