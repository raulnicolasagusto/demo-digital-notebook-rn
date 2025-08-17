import React, { useRef, useState } from 'react';
import { View, PanResponder, Animated, Vibration, Text } from 'react-native';

interface PressHoldCanvasProps {
  children: React.ReactNode;
  canvasWidth: number;
  canvasHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  scrollX: number;
  scrollY: number;
  onScrollChange: (scrollX: number, scrollY: number) => void;
}

export const PressHoldCanvas: React.FC<PressHoldCanvasProps> = ({
  children,
  canvasWidth,
  canvasHeight,
  viewportWidth,
  viewportHeight,
  scrollX,
  scrollY,
  onScrollChange,
}) => {
  const pan = useRef(new Animated.ValueXY({ x: -scrollX, y: -scrollY })).current;
  const [isHoldActive, setIsHoldActive] = useState(false);
  const holdTimeout = useRef<any>(null);

  // Calcular límites del scroll
  const maxScrollX = Math.max(0, canvasWidth - viewportWidth);
  const maxScrollY = Math.max(0, canvasHeight - viewportHeight);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => isHoldActive, // Solo si está activo el hold

    onPanResponderGrant: (evt, gestureState) => {
      // Iniciar timer para detectar "press and hold"
      holdTimeout.current = setTimeout(() => {
        setIsHoldActive(true);
        // Vibración ligera para confirmar activación
        Vibration.vibrate(50);
        
        // Establecer la posición inicial para el arrastre
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      }, 10); // 10ms para activar el modo drag
    },

    onPanResponderMove: (evt, gestureState) => {
      if (isHoldActive) {
        // Solo mover si el hold está activo
        const newX = gestureState.dx;
        const newY = gestureState.dy;
        
        // Calcular nueva posición de scroll
        const currentScrollX = scrollX - newX;
        const currentScrollY = scrollY - newY;
        
        // Aplicar límites
        const clampedScrollX = Math.max(0, Math.min(currentScrollX, maxScrollX));
        const clampedScrollY = Math.max(0, Math.min(currentScrollY, maxScrollY));
        
        // Actualizar posición animada
        pan.setValue({ 
          x: -clampedScrollX + scrollX, 
          y: -clampedScrollY + scrollY 
        });
        
        // Actualizar scroll en el padre
        onScrollChange(clampedScrollX, clampedScrollY);
      }
    },

    onPanResponderRelease: () => {
      // Limpiar timeout si se suelta antes del hold
      if (holdTimeout.current) {
        clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
      }
      
      if (isHoldActive) {
        // Finalizar el modo drag
        pan.flattenOffset();
        setIsHoldActive(false);
      }
    },

    onPanResponderTerminate: () => {
      // Limpiar en caso de interrupción
      if (holdTimeout.current) {
        clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
      }
      setIsHoldActive(false);
      pan.flattenOffset();
    },
  });

  // Sincronizar con cambios externos
  React.useEffect(() => {
    if (!isHoldActive) {
      pan.setValue({ x: -scrollX, y: -scrollY });
    }
  }, [scrollX, scrollY, isHoldActive]);

  return (
    <View
      style={{
        width: viewportWidth,
        height: viewportHeight,
        overflow: 'hidden',
        backgroundColor: isHoldActive ? '#E0F2FE' : '#E5E7EB', // Cambio visual cuando está activo
        borderWidth: isHoldActive ? 2 : 0,
        borderColor: '#0EA5E9',
        borderRadius: 8,
      }}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[
          {
            width: canvasWidth,
            height: canvasHeight,
          },
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
            ],
          },
        ]}
      >
        {children}
      </Animated.View>
      
      {/* Indicador visual del estado */}
      {isHoldActive && (
        <View
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: '#0EA5E9',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            Modo Arrastre
          </Text>
        </View>
      )}
    </View>
  );
};
