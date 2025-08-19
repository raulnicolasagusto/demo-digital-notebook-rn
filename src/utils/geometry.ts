/**
 * Utilidades de geometría y transformación para el sistema Zoom Window
 * Implementación basada en el patrón de GoodNotes
 */

export interface Point {
  x: number;
  y: number;
  t?: number;
  pressure?: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  width: number;
  color: string;
  opacity?: number;
  tool?: 'pen' | 'pencil' | 'highlighter' | 'eraser';
}

/**
 * Mapea un punto desde las coordenadas de la ventana de zoom al canvas principal
 * @param zx - Coordenada X en la ventana de zoom
 * @param zy - Coordenada Y en la ventana de zoom  
 * @param zw - Ancho de la ventana de zoom
 * @param zh - Alto de la ventana de zoom
 * @param rect - Rectángulo objetivo en el canvas principal
 * @param padX - Padding horizontal interno de la ventana de zoom
 * @param padY - Padding vertical interno de la ventana de zoom
 */
export function mapPointFromZoomToCanvas(
  zx: number, 
  zy: number,
  zw: number, 
  zh: number,
  rect: Rect,
  padX = 0, 
  padY = 0
): Point {
  const innerW = Math.max(1, zw - 2 * padX);
  const innerH = Math.max(1, zh - 2 * padY);
  
  const u = Math.min(1, Math.max(0, (zx - padX) / innerW));
  const v = Math.min(1, Math.max(0, (zy - padY) / innerH));
  
  return { 
    x: rect.x + u * rect.width, 
    y: rect.y + v * rect.height 
  };
}

/**
 * Mapea un punto desde el canvas principal a las coordenadas de la ventana de zoom
 * @param cx - Coordenada X en el canvas principal
 * @param cy - Coordenada Y en el canvas principal
 * @param zw - Ancho de la ventana de zoom
 * @param zh - Alto de la ventana de zoom
 * @param rect - Rectángulo objetivo en el canvas principal
 * @param padX - Padding horizontal interno de la ventana de zoom
 * @param padY - Padding vertical interno de la ventana de zoom
 */
export function mapPointFromCanvasToZoom(
  cx: number,
  cy: number,
  zw: number,
  zh: number,
  rect: Rect,
  padX = 0,
  padY = 0
): Point | null {
  // Verificar si el punto está dentro del rectángulo objetivo
  if (cx < rect.x || cx > rect.x + rect.width || 
      cy < rect.y || cy > rect.y + rect.height) {
    return null;
  }

  const innerW = Math.max(1, zw - 2 * padX);
  const innerH = Math.max(1, zh - 2 * padY);
  
  const u = (cx - rect.x) / rect.width;
  const v = (cy - rect.y) / rect.height;
  
  return {
    x: padX + u * innerW,
    y: padY + v * innerH
  };
}

/**
 * Calcula la escala de grosor de trazo al transformar desde zoom a canvas
 * @param strokeWidth - Ancho del trazo en la ventana de zoom
 * @param zw - Ancho de la ventana de zoom
 * @param zh - Alto de la ventana de zoom  
 * @param rect - Rectángulo objetivo en el canvas principal
 * @param scaleStrokeToTarget - Si debe escalar el grosor del trazo
 */
export function calculateStrokeWidth(
  strokeWidth: number,
  zw: number,
  zh: number,
  rect: Rect,
  scaleStrokeToTarget: boolean = true
): number {
  if (!scaleStrokeToTarget) {
    return strokeWidth;
  }

  const scaleX = rect.width / zw;
  const scaleY = rect.height / zh;
  
  // Promedio isotrópico para mantener la proporción visual
  return strokeWidth * 0.5 * (scaleX + scaleY);
}

/**
 * Convierte un stroke completo de coordenadas de zoom a canvas
 * @param stroke - Stroke en coordenadas de zoom
 * @param zw - Ancho de la ventana de zoom
 * @param zh - Alto de la ventana de zoom
 * @param rect - Rectángulo objetivo en el canvas principal  
 * @param padX - Padding horizontal interno
 * @param padY - Padding vertical interno
 * @param scaleStrokeToTarget - Si debe escalar el grosor del trazo
 */
export function transformStrokeFromZoomToCanvas(
  stroke: Stroke,
  zw: number,
  zh: number,
  rect: Rect,
  padX = 0,
  padY = 0,
  scaleStrokeToTarget = true
): Stroke {
  const transformedPoints = stroke.points.map(point =>
    mapPointFromZoomToCanvas(point.x, point.y, zw, zh, rect, padX, padY)
  );

  const transformedWidth = calculateStrokeWidth(
    stroke.width, zw, zh, rect, scaleStrokeToTarget
  );

  return {
    ...stroke,
    points: transformedPoints,
    width: transformedWidth
  };
}

/**
 * Convierte un stroke completo de coordenadas de canvas a zoom
 * @param stroke - Stroke en coordenadas de canvas
 * @param zw - Ancho de la ventana de zoom
 * @param zh - Alto de la ventana de zoom
 * @param rect - Rectángulo objetivo en el canvas principal
 * @param padX - Padding horizontal interno
 * @param padY - Padding vertical interno  
 */
export function transformStrokeFromCanvasToZoom(
  stroke: Stroke,
  zw: number,
  zh: number,
  rect: Rect,
  padX = 0,
  padY = 0
): Stroke | null {
  const transformedPoints: Point[] = [];
  
  for (const point of stroke.points) {
    const zoomPoint = mapPointFromCanvasToZoom(
      point.x, point.y, zw, zh, rect, padX, padY
    );
    if (zoomPoint) {
      transformedPoints.push({
        ...point,
        x: zoomPoint.x,
        y: zoomPoint.y
      });
    }
  }

  // Si no hay puntos válidos, el stroke no intersecta el área
  if (transformedPoints.length === 0) {
    return null;
  }

  // Calcular el grosor inverso (desde canvas a zoom)
  const scaleX = rect.width / zw;
  const scaleY = rect.height / zh;
  const inverseScale = 2.0 / (scaleX + scaleY);
  
  return {
    ...stroke,
    points: transformedPoints,
    width: stroke.width * inverseScale
  };
}

/**
 * Verifica si un rectángulo está dentro de los límites del canvas
 * @param rect - Rectángulo a verificar
 * @param canvasWidth - Ancho del canvas
 * @param canvasHeight - Alto del canvas
 */
export function clampRectToCanvas(
  rect: Rect,
  canvasWidth: number,
  canvasHeight: number
): Rect {
  const clampedX = Math.max(0, Math.min(rect.x, canvasWidth - rect.width));
  const clampedY = Math.max(0, Math.min(rect.y, canvasHeight - rect.height));
  const clampedWidth = Math.min(rect.width, canvasWidth - clampedX);
  const clampedHeight = Math.min(rect.height, canvasHeight - clampedY);

  return {
    x: clampedX,
    y: clampedY,
    width: clampedWidth,
    height: clampedHeight
  };
}

/**
 * Calcula las coordenadas de las asas de redimensionamiento para un rectángulo
 * @param rect - Rectángulo base
 * @param handleSize - Tamaño de las asas
 */
export function getResizeHandles(rect: Rect, handleSize: number = 12) {
  const half = handleSize / 2;
  
  return {
    topLeft: { x: rect.x - half, y: rect.y - half, width: handleSize, height: handleSize },
    topRight: { x: rect.x + rect.width - half, y: rect.y - half, width: handleSize, height: handleSize },
    bottomLeft: { x: rect.x - half, y: rect.y + rect.height - half, width: handleSize, height: handleSize },
    bottomRight: { x: rect.x + rect.width - half, y: rect.y + rect.height - half, width: handleSize, height: handleSize },
    topCenter: { x: rect.x + rect.width / 2 - half, y: rect.y - half, width: handleSize, height: handleSize },
    bottomCenter: { x: rect.x + rect.width / 2 - half, y: rect.y + rect.height - half, width: handleSize, height: handleSize },
    leftCenter: { x: rect.x - half, y: rect.y + rect.height / 2 - half, width: handleSize, height: handleSize },
    rightCenter: { x: rect.x + rect.width - half, y: rect.y + rect.height / 2 - half, width: handleSize, height: handleSize }
  };
}
