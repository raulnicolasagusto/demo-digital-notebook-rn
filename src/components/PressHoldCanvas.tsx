import React, { useRef, useState, useCallback } from 'react';
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
  
  // Referencias para evitar actualizaciones innecesarias
  const lastScrollUpdate = useRef({ x: scrollX, y: scrollY });
  const isMoving = useRef(false);

  // Calcular límites del scroll
  const maxScrollX = Math.max(0, canvasWidth - viewportWidth);
  const maxScrollY = Math.max(0, canvasHeight - viewportHeight);

  // Throttle para actualizaciones del scroll padre (más fluido)
  const throttledScrollUpdate = useCallback(
    (() => {
      let timeoutId: any = null;
      return (newScrollX: number, newScrollY: number) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // Solo actualizar si realmente cambió
          if (lastScrollUpdate.current.x !== newScrollX || lastScrollUpdate.current.y !== newScrollY) {
            lastScrollUpdate.current = { x: newScrollX, y: newScrollY };
            onScrollChange(newScrollX, newScrollY);
          }
        }, 16); // 60fps aproximadamente
      };
    })(),
    [onScrollChange]
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => isHoldActive,

    onPanResponderGrant: (evt, gestureState) => {
      // Para dos dedos, activar inmediatamente
      if (evt.nativeEvent.touches.length >= 2) {
        setIsHoldActive(true);
        Vibration.vibrate(30); // Vibración más corta
        isMoving.current = true;
        
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      } else {
        // Para un dedo, usar timer más corto
        holdTimeout.current = setTimeout(() => {
          setIsHoldActive(true);
          Vibration.vibrate(30);
          isMoving.current = true;
          
          pan.setOffset({
            x: (pan.x as any)._value,
            y: (pan.y as any)._value,
          });
          pan.setValue({ x: 0, y: 0 });
        }, 200); // Reducido a 200ms para respuesta más rápida
      }
    },

    onPanResponderMove: (evt, gestureState) => {
      if (isHoldActive && isMoving.current) {
        // Usar valores directos del gesto para movimiento más fluido
        const translateX = gestureState.dx;
        const translateY = gestureState.dy;
        
        // Calcular posición objetivo
        const targetScrollX = scrollX - translateX;
        const targetScrollY = scrollY - translateY;
        
        // Aplicar límites
        const clampedScrollX = Math.max(0, Math.min(targetScrollX, maxScrollX));
        const clampedScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));
        
        // Actualizar animación inmediatamente (sin throttle)
        const finalTranslateX = -(clampedScrollX - scrollX);
        const finalTranslateY = -(clampedScrollY - scrollY);
        
        pan.setValue({ 
          x: finalTranslateX, 
          y: finalTranslateY 
        });
        
        // Actualizar scroll del padre con throttle
        throttledScrollUpdate(clampedScrollX, clampedScrollY);
      }
    },

    onPanResponderRelease: () => {
      if (holdTimeout.current) {
        clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
      }
      
      if (isHoldActive) {
        isMoving.current = false;
        pan.flattenOffset();
        setIsHoldActive(false);
      }
    },

    onPanResponderTerminate: () => {
      if (holdTimeout.current) {
        clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
      }
      isMoving.current = false;
      setIsHoldActive(false);
      pan.flattenOffset();
    },
  });

  // Sincronizar con cambios externos solo cuando no estamos moviendo
  React.useEffect(() => {
    if (!isHoldActive && !isMoving.current) {
      pan.setValue({ x: -scrollX, y: -scrollY });
      lastScrollUpdate.current = { x: scrollX, y: scrollY };
    }
  }, [scrollX, scrollY, isHoldActive]);

  return (
    <View
      style={{
        width: viewportWidth,
        height: viewportHeight,
        overflow: 'hidden',
        backgroundColor: isHoldActive ? '#E0F2FE' : '#E5E7EB',
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
        // Optimización: reduce re-renders
        removeClippedSubviews={true}
        renderToHardwareTextureAndroid={true}
      >
        {children}
      </Animated.View>
      
      {/* Indicador visual optimizado */}
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
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        >
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            🖐️ Arrastrar
          </Text>
        </View>
      )}
    </View>
  );
};
