import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView, Text } from 'react-native';
import { CanvasWithZoomWindow } from '@/components/CanvasWithZoomWindow';
import { Stroke, Rect } from '@/utils/geometry';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Strokes de ejemplo para demostración
const sampleStrokes: Stroke[] = [
  {
    id: 'demo-stroke-1',
    points: [
      { x: 100, y: 100 },
      { x: 150, y: 120 },
      { x: 200, y: 100 },
      { x: 250, y: 130 },
    ],
    width: 3,
    color: '#2563EB',
    opacity: 1,
    tool: 'pen'
  },
  {
    id: 'demo-stroke-2',
    points: [
      { x: 300, y: 200 },
      { x: 320, y: 250 },
      { x: 340, y: 200 },
      { x: 360, y: 270 },
    ],
    width: 2,
    color: '#DC2626',
    opacity: 0.8,
    tool: 'pencil'
  }
];

export const ZoomWindowDemo: React.FC = () => {
  const [strokes, setStrokes] = useState<Stroke[]>(sampleStrokes);
  const [targetRect, setTargetRect] = useState<Rect>({
    x: 200,
    y: 150,
    width: 120,
    height: 120
  });
  const [isActive, setIsActive] = useState(true);

  const handleAddStroke = (stroke: Stroke) => {
    console.log('Nueva línea agregada:', stroke);
    setStrokes(prev => [...prev, stroke]);
  };

  const handleClearArea = () => {
    // Filtrar strokes que NO están en el área objetivo
    const filteredStrokes = strokes.filter(stroke => {
      return !stroke.points.some(point => 
        point.x >= targetRect.x && point.x <= targetRect.x + targetRect.width &&
        point.y >= targetRect.y && point.y <= targetRect.y + targetRect.height
      );
    });
    setStrokes(filteredStrokes);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Demo: Zoom Window estilo GoodNotes</Text>
        <Text style={styles.subtitle}>
          Dibuja en el área inferior y se replica en el canvas superior
        </Text>
      </View>

      <CanvasWithZoomWindow
        canvasWidth={960}
        canvasHeight={600}
        targetRect={targetRect}
        onChangeTargetRect={setTargetRect}
        zoomWindowWidth={screenWidth}
        zoomWindowHeight={300}
        zoomFactor={3.0}
        strokes={strokes}
        onAddStroke={handleAddStroke}
        onUpdateStrokePartial={(id, partial) => {
          console.log('Actualizando stroke:', id, partial);
        }}
        onCommitStroke={(id) => {
          console.log('Stroke finalizado:', id);
        }}
        onClearArea={handleClearArea}
        strokeStyle={{
          width: 2,
          color: '#1F2937',
          opacity: 1,
          scaleStrokeToTarget: true
        }}
        isActive={isActive}
        onClose={() => setIsActive(false)}
        pencilOnlyDraw={false}
        allowFingerPan={true}
      >
        {/* Canvas de demostración */}
        <View style={styles.demoCanvas}>
          <Text style={styles.canvasLabel}>Canvas Principal (960x600)</Text>
          <View style={styles.canvasGrid} />
        </View>
      </CanvasWithZoomWindow>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  demoCanvas: {
    width: 960,
    height: 600,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  canvasLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  canvasGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    // Aquí podrías agregar un patrón de grid con CSS o SVG
  },
});
