/**
 * 🚀 FASE 2: Stroke Smoothing Utilities
 * 
 * Funciones para optimizar y suavizar los trazos de dibujo
 * reduciendo puntos innecesarios mientras mantiene la forma.
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * Convierte un string de path SVG a array de puntos
 */
export const pathStringToPoints = (pathString: string): Point[] => {
  const points: Point[] = [];
  const commands = pathString.split(/[ML]/);
  
  for (let i = 1; i < commands.length; i++) {
    const coords = commands[i].trim();
    if (coords) {
      const [x, y] = coords.split(',').map(parseFloat);
      if (!isNaN(x) && !isNaN(y)) {
        points.push({ x, y });
      }
    }
  }
  
  return points;
};

/**
 * Convierte array de puntos a string de path SVG
 */
export const pointsToPathString = (points: Point[]): string => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  
  const firstPoint = points[0];
  const restPoints = points.slice(1);
  
  return `M${firstPoint.x.toFixed(1)},${firstPoint.y.toFixed(1)} L${restPoints
    .map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' L')}`;
};

/**
 * Calcula la distancia entre dos puntos
 */
const getDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

/**
 * Calcula la distancia perpendicular de un punto a una línea
 */
const perpendicularDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
  const A = lineEnd.y - lineStart.y;
  const B = lineStart.x - lineEnd.x;
  const C = lineEnd.x * lineStart.y - lineStart.x * lineEnd.y;
  
  return Math.abs(A * point.x + B * point.y + C) / Math.sqrt(A * A + B * B);
};

/**
 * Algoritmo Douglas-Peucker simplificado para reducir puntos
 * 
 * @param points - Array de puntos originales
 * @param tolerance - Tolerancia para eliminación (mayor = menos puntos)
 * @returns Array de puntos simplificados
 */
export const simplifyStroke = (points: Point[], tolerance: number = 2.0): Point[] => {
  if (points.length <= 2) return points;
  
  const douglasPeucker = (pts: Point[], tol: number): Point[] => {
    if (pts.length <= 2) return pts;
    
    // Encontrar el punto con la mayor distancia perpendicular
    let maxDistance = 0;
    let maxIndex = 0;
    const start = pts[0];
    const end = pts[pts.length - 1];
    
    for (let i = 1; i < pts.length - 1; i++) {
      const distance = perpendicularDistance(pts[i], start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }
    
    // Si la distancia máxima es menor que la tolerancia, simplificar
    if (maxDistance < tol) {
      return [start, end];
    }
    
    // Recursivamente simplificar ambas partes
    const left = douglasPeucker(pts.slice(0, maxIndex + 1), tol);
    const right = douglasPeucker(pts.slice(maxIndex), tol);
    
    // Combinar resultados (eliminar punto duplicado)
    return [...left.slice(0, -1), ...right];
  };
  
  return douglasPeucker(points, tolerance);
};

/**
 * Elimina puntos muy cercanos para reducir redundancia
 * 
 * @param points - Array de puntos originales  
 * @param minDistance - Distancia mínima entre puntos
 * @returns Array de puntos filtrados
 */
export const removeRedundantPoints = (points: Point[], minDistance: number = 1.5): Point[] => {
  if (points.length <= 1) return points;
  
  const filtered: Point[] = [points[0]]; // Siempre mantener el primer punto
  
  for (let i = 1; i < points.length; i++) {
    const distance = getDistance(filtered[filtered.length - 1], points[i]);
    if (distance >= minDistance || i === points.length - 1) {
      // Mantener si está suficientemente lejos o es el último punto
      filtered.push(points[i]);
    }
  }
  
  return filtered;
};

/**
 * Función principal de optimización de trazo
 * Combina eliminación de redundancia + simplificación Douglas-Peucker
 * 
 * @param pathString - String de path SVG original
 * @param options - Opciones de optimización
 * @returns String de path SVG optimizado
 */
export const optimizeStroke = (
  pathString: string, 
  options: {
    minDistance?: number;
    tolerance?: number;
    maxPoints?: number;
  } = {}
): string => {
  const { minDistance = 1.5, tolerance = 2.0, maxPoints = 100 } = options;
  
  let points = pathStringToPoints(pathString);
  
  // Paso 1: Eliminar puntos redundantes
  points = removeRedundantPoints(points, minDistance);
  
  // Paso 2: Simplificar con Douglas-Peucker si hay demasiados puntos
  if (points.length > maxPoints) {
    points = simplifyStroke(points, tolerance);
  }
  
  // Paso 3: Convertir de vuelta a path string
  return pointsToPathString(points);
};

/**
 * Configuraciones preestablecidas para diferentes casos de uso
 */
export const SMOOTHING_PRESETS = {
  // Para dibujo rápido - máxima performance
  PERFORMANCE: {
    minDistance: 3.0,
    tolerance: 4.0,
    maxPoints: 50,
  },
  
  // Para dibujo normal - balance entre calidad y performance
  BALANCED: {
    minDistance: 1.5,
    tolerance: 2.0,
    maxPoints: 100,
  },
  
  // Para dibujo detallado - máxima calidad
  QUALITY: {
    minDistance: 0.5,
    tolerance: 1.0,
    maxPoints: 200,
  },
};
