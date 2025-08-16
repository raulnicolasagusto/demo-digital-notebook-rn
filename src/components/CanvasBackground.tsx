import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface CanvasBackgroundProps {
  backgroundId: string | null;
  width: number;
  height: number;
}

// Mapeo de IDs a imágenes reales
const backgroundImages: { [key: string]: any } = {
  'hoja1': require('@/assets/notebookBackground/hoja1.jpg'),
  'hoja2': require('@/assets/notebookBackground/hoja2.jpg'),
  'hoja3': require('@/assets/notebookBackground/hoja3.jpg'),
  'hoja4': require('@/assets/notebookBackground/hoja4.jpg'),
  'hoja5': require('@/assets/notebookBackground/hoja5.jpg'),
  'hoja6': require('@/assets/notebookBackground/hoja6.jpg'),
  'hoja7': require('@/assets/notebookBackground/hoja7.jpg'),
  'hoja8': require('@/assets/notebookBackground/hoja8.jpg'),
  'hoja9': require('@/assets/notebookBackground/hoja9.jpg'),
  'hoja10': require('@/assets/notebookBackground/hoja10.jpg'),
};

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  backgroundId,
  width,
  height,
}) => {
  if (!backgroundId || !backgroundImages[backgroundId]) {
    return null;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Image
        source={backgroundImages[backgroundId]}
        style={[styles.backgroundImage, { width, height }]}
        resizeMode="stretch"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1, // Por debajo del contenido del canvas pero por encima del fondo
  },
  backgroundImage: {
    opacity: 0.3, // Hacer la imagen más sutil para que no interfiera con el contenido
  },
});
