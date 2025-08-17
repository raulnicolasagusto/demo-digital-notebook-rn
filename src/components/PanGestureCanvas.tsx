import React, { useRef, useState } from 'react';
import { View, PanResponder, Animated } from 'react-native';

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
  const pan = useRef(new Animated.ValueXY({ x: -scrollX, y: -scrollY })).current;
  const [activeFingers, setActiveFingers] = useState(0);
  const [currentPanX, setCurrentPanX] = useState(-scrollX);
  const [currentPanY, setCurrentPanY] = useState(-scrollY);

  // Calcular límites del scroll
  const maxScrollX = Math.max(0, canvasWidth - viewportWidth);
  const maxScrollY = Math.max(0, canvasHeight - viewportHeight);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Solo activar si hay exactamente 2 dedos
      return evt.nativeEvent.touches.length === 2;
    },
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
      return evt.nativeEvent.touches.length === 2;
    },
    onPanResponderGrant: (evt, gestureState) => {
      if (evt.nativeEvent.touches.length === 2) {
        setActiveFingers(2);
        pan.setOffset({
          x: currentPanX,
          y: currentPanY,
        });
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (evt.nativeEvent.touches.length === 2) {
        // Calcular nueva posición con límites
        let newX = gestureState.dx;
        let newY = gestureState.dy;
        
        const targetScrollX = -(currentPanX + newX);
        const targetScrollY = -(currentPanY + newY);
        
        // Aplicar límites
        if (targetScrollX < 0) newX = -currentPanX;
        if (targetScrollX > maxScrollX) newX = -maxScrollX - currentPanX;
        if (targetScrollY < 0) newY = -currentPanY;
        if (targetScrollY > maxScrollY) newY = -maxScrollY - currentPanY;
        
        pan.setValue({ x: newX, y: newY });
        
        // Actualizar el scroll en el componente padre
        const newScrollX = Math.max(0, Math.min(-(currentPanX + newX), maxScrollX));
        const newScrollY = Math.max(0, Math.min(-(currentPanY + newY), maxScrollY));
        onScrollChange(newScrollX, newScrollY);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      setActiveFingers(0);
      const newPanX = currentPanX + gestureState.dx;
      const newPanY = currentPanY + gestureState.dy;
      setCurrentPanX(newPanX);
      setCurrentPanY(newPanY);
      pan.flattenOffset();
    },
    onPanResponderTerminate: (evt, gestureState) => {
      setActiveFingers(0);
      pan.flattenOffset();
    },
  });

  // Sincronizar con cambios externos del scroll
  React.useEffect(() => {
    const newPanX = -scrollX;
    const newPanY = -scrollY;
    setCurrentPanX(newPanX);
    setCurrentPanY(newPanY);
    pan.setValue({ x: newPanX, y: newPanY });
  }, [scrollX, scrollY]);

  return (
    <View
      style={{
        width: viewportWidth,
        height: viewportHeight,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
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
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};
