// Types for the new canvas system
export interface Point {
  x: number;
  y: number;
}

export interface DrawPath {
  id: string;
  points: Point[];
  color: string;
  strokeWidth: number;
  tool: 'pen' | 'pencil' | 'marker';
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
}

export interface CanvasState {
  paths: DrawPath[];
  textElements: TextElement[];
  backgroundId?: string;
}

export type CanvasMode = 'draw' | 'text' | 'zoom';

export interface CanvasDimensions {
  width: number;
  height: number;
  scale: number;
}

export interface ZoomWindow {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  isActive: boolean;
}