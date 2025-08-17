# Área de Escritura (Zoom Window) - Estilo GoodNotes

## Resumen
Se ha implementado una herramienta de "Área de escritura" inspirada en la funcionalidad de GoodNotes que permite a los usuarios dibujar con mayor precisión en áreas específicas del canvas mediante una ventana de zoom con sincronización bidireccional.

## Características Implementadas

### 1. Nueva Herramienta en FloatingToolButton
- **Icono**: ZoomIn (lupa con +) con color púrpura (#6D28D9)
- **Nombre**: "Área de escritura"
- **Estado**: Activa cuando `isMagnifyingGlassMode = true`

### 2. Componente ZoomWindow (reemplaza MagnifyingGlassTool)
- **Ubicación**: `src/components/ZoomWindow.tsx`
- **Funcionalidad Principal**:
  - Overlay de instrucciones al activar (auto-cierre en 3 segundos)
  - Selección de área en el canvas mediante toque
  - Panel de zoom inferior con amplificación 3x
  - **Sincronización bidireccional** entre canvas y ventana de zoom
  - Visualización del área seleccionada en el canvas con indicadores visuales

### 3. Proceso de Uso

#### Paso 1: Activación
1. Usuario toca el FAB (botón flotante)
2. Selecciona el icono de ZoomIn
3. Aparece overlay con instrucciones sobre "Área de escritura"

#### Paso 2: Selección de Área
1. Usuario toca el área del canvas donde quiere escribir
2. Se ocultan las instrucciones automáticamente
3. Se muestra un marco rectangular con indicador central en el área seleccionada (120x120px)
4. Se desliza hacia arriba el panel de zoom

#### Paso 3: Dibujo con Sincronización Bidireccional
1. **Canvas → Zoom**: Los dibujos existentes en el área seleccionada aparecen automáticamente en la ventana de zoom
2. **Zoom → Canvas**: Usuario dibuja en el panel inferior y se refleja instantáneamente en el canvas
3. **Factor de amplificación**: 3x (configurable)
4. **Grid de referencia**: Cuadrícula sutil en la ventana de zoom para mayor precisión

#### Paso 4: Controles Mejorados
- **Nueva**: Permite seleccionar otra área del canvas
- **Limpiar**: Borra solo los dibujos del área seleccionada (tanto en zoom como en canvas)
- **Cerrar**: Cierra la herramienta y vuelve al modo normal

## Archivos Modificados

### 1. `ZoomWindow.tsx` (NUEVO - reemplaza MagnifyingGlassTool.tsx)
- Componente completamente rediseñado
- Sincronización bidireccional automática
- Visualización mejorada con grid y indicadores
- Gestión inteligente de coordenadas con conversión precisa
- Interfaz más profesional con iconografía descriptiva

### 2. `FloatingToolButton.tsx`
- Cambiado icono de Search a ZoomIn
- Mantenidas todas las funcionalidades existentes
- Mejor representación visual del propósito

### 3. `[id].tsx` (Notebook principal)
- Actualizada importación a ZoomWindow
- Nuevas props para sincronización bidireccional:
  - `canvasPaths`: Array de paths actuales del canvas
  - `canvasScale`: Escala actual del canvas
  - `canvasOffset`: Offset de posición del canvas
- Función simplificada de actualización de dibujos
- Tipado mejorado para handlers

### 4. Archivos de Canvas (sin cambios)
- `ResponsiveCanvas.tsx`: Mantiene detección de toques
- `PressHoldCanvas.tsx`: Mantiene conversión de coordenadas

## Aspectos Técnicos Avanzados

### Sincronización Bidireccional
```typescript
// Canvas → Zoom: Filtrar y convertir paths existentes
const convertCanvasPathToZoomPath = (canvasPath: string, areaX: number, areaY: number) => {
  // Verificar si los puntos están dentro del área seleccionada
  // Convertir coordenadas del canvas a coordenadas de zoom
  const zoomX = (canvasX - areaX) * (zoomWidth / AREA_SIZE);
  const zoomY = (canvasY - areaY) * (zoomHeight / AREA_SIZE);
}

// Zoom → Canvas: Convertir dibujos del zoom al canvas
const convertZoomPathToCanvasPath = (zoomPath: DrawPath, area: { x: number; y: number }) => {
  // Convertir coordenadas de zoom a coordenadas absolutas del canvas
  const canvasX = areaLeftX + (zoomX * AREA_SIZE / zoomWidth);
  const canvasY = areaTopY + (zoomY * AREA_SIZE / zoomHeight);
}
```

### Indicadores Visuales
- **Marco del área**: Borde púrpura con fondo translúcido
- **Indicador central**: Pequeño cuadrado blanco en el centro
- **Grid de referencia**: Cuadrícula sutil en la ventana de zoom
- **Barra de estado**: Información de posición y zoom en tiempo real

### Gestión Inteligente de Dibujos
- **Filtrado por área**: Solo los paths dentro del área seleccionada aparecen en zoom
- **Limpieza selectiva**: Al limpiar, solo se eliminan los dibujos del área actual
- **Conversión precisa**: Matemáticas exactas para mapeo de coordenadas

## Configuración

### Constantes Principales
- **ZOOM_AREA_HEIGHT**: 280px (altura del panel de zoom)
- **ZOOM_SCALE**: 3 (factor de amplificación)
- **AREA_SIZE**: 120px (tamaño del área capturada en el canvas)
- **Canvas dimensions**: 960x1200px (sin cambios)

### Estados y Props
```typescript
interface ZoomWindowProps {
  isActive: boolean;
  onClose: () => void;
  onDrawingUpdate: (paths: DrawPath[]) => void;
  canvasWidth: number;
  canvasHeight: number;
  canvasPaths: DrawPath[];        // NUEVO
  canvasScale: number;            // NUEVO  
  canvasOffset: { x: number; y: number }; // NUEVO
  onCanvasTouchHandler?: (handler: (x: number, y: number) => void) => void;
}
```

## Flujo de Estados Mejorado
1. `isMagnifyingGlassMode: false` → Modo normal
2. Usuario selecciona ZoomIn → `isMagnifyingGlassMode: true`
3. Aparece overlay de instrucciones "Área de escritura"
4. Usuario toca canvas → Se selecciona área y se sincronizan paths existentes
5. Se ocultan instrucciones, aparece panel con dibujos del área
6. Usuario dibuja → Reflejo bidireccional instantáneo
7. Opciones: Nueva área, Limpiar área específica, o Cerrar
8. Usuario cierra → `isMagnifyingGlassMode: false`

## Mejoras de UX/UI

### Indicadores Visuales
- ✅ Marco rectangular claro del área seleccionada
- ✅ Grid de referencia en el panel de zoom
- ✅ Barra de estado con información de posición y zoom
- ✅ Iconografía más descriptiva (ZoomIn, Target, RotateCcw)

### Interacción
- ✅ Auto-cierre de instrucciones (3 segundos)
- ✅ Sincronización automática al seleccionar área
- ✅ Controles intuitivos con iconos descriptivos
- ✅ Limpieza selectiva por área

### Rendimiento
- ✅ Filtrado eficiente de paths por área
- ✅ Conversión matemática precisa
- ✅ Gestión optimizada de estados
- ✅ Sin impacto en funcionalidades existentes

## Compatibilidad
- ✅ Tablets modernas (≥1280px)
- ✅ Dispositivos pequeños con scroll
- ✅ Android e iOS
- ✅ Modo inmersivo
- ✅ Integración completa con sistema de páginas existente
- ✅ **Retrocompatibilidad total** con todas las funcionalidades del canvas

## Diferencias Clave vs Versión Anterior

### Funcionalidad
- **Antes**: Dibujo unidireccional (zoom → canvas)
- **Ahora**: Sincronización bidireccional completa
- **Antes**: Área circular simple
- **Ahora**: Área rectangular con indicadores visuales
- **Antes**: Factor 2x
- **Ahora**: Factor 3x con grid de referencia

### Experiencia
- **Antes**: Manual y básico
- **Ahora**: Automático e intuitivo, similar a GoodNotes
- **Antes**: Sin contexto visual del área
- **Ahora**: Marco claro y información de estado

La nueva implementación transforma la funcionalidad básica de lupa en una herramienta profesional de "Área de escritura" que rivaliza con aplicaciones comerciales como GoodNotes, manteniendo la compatibilidad total con el ecosistema existente.
