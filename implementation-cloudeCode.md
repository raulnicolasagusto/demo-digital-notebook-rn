# Implementation Guidelines para Claude Code

## 🎯 Objetivo Principal
Este documento contiene las directrices esenciales que debe seguir Claude Code al implementar, modificar o corregir funcionalidades en la aplicación.

## 🔧 Principios Fundamentales de Desarrollo

### 1. Modificaciones Mínimas e Incrementales
- **REGLA PRINCIPAL**: Solo modificar el código estrictamente necesario para cumplir con el requerimiento
- **NO tocar** archivos o funciones que no estén directamente relacionados con el cambio solicitado
- Hacer cambios granulares, una funcionalidad a la vez
- Evitar refactorizaciones masivas a menos que se soliciten explícitamente

### 2. Proceso de Implementación Paso a Paso

#### Antes de Codificar:
1. **Analizar el requerimiento** completamente antes de empezar
2. **Identificar archivos afectados** y listar solo los que necesitan cambios
3. **Planificar la implementación** más simple posible
4. **Solicitar documentación** si es necesaria para entender APIs, bibliotecas o patrones específicos

#### Durante el Desarrollo:
1. **Implementar** solo la funcionalidad solicitada
2. **Mantener** el estilo de código existente
3. **Conservar** la estructura y patrones actuales del proyecto
4. **NO optimizar** código existente que funciona correctamente

#### Después del Desarrollo:
1. **Revisar el código** implementado línea por línea
2. **Verificar** que solo se modificaron los archivos necesarios
3. **Comprobar** que la funcionalidad nueva no rompe la existente
4. **Documentar** cambios si es necesario

### 3. Gestión de Errores y Debugging

#### Al Solucionar Errores:
- **Identificar** la causa raíz específica del error
- **Corregir** únicamente el problema identificado
- **NO cambiar** código que funciona correctamente
- **Probar** que la corrección resuelve el problema sin crear nuevos

#### Al Encontrar Múltiples Problemas:
- **Abordar** un problema a la vez
- **Preguntar** al usuario si desea continuar con el siguiente problema
- **Mantener** un registro de cambios realizados

## 📚 Gestión de Documentación

### Solicitud de Documentación
Cuando sea necesario consultar documentación específica:

```
"Necesito revisar la documentación de [TECNOLOGÍA/BIBLIOTECA] para implementar [FUNCIONALIDAD]. 
¿Puedes proporcionarme la documentación oficial o enlaces relevantes?"
```

### Uso de Documentación Externa
Si el usuario proporciona un enlace a documentación:

```
"He revisado la documentación proporcionada en [ENLACE]. 
Basándome en la sección [X], implementaré [FUNCIONALIDAD] siguiendo [PATRÓN/MÉTODO ESPECÍFICO]."
```

## 🚫 Restricciones y Límites

### Lo que NO se debe hacer:
- ❌ Cambiar arquitectura existente sin autorización explícita
- ❌ Refactorizar código que no está relacionado con el requerimiento
- ❌ Agregar dependencias no solicitadas
- ❌ Modificar configuraciones globales sin consultar
- ❌ Implementar patrones diferentes a los ya establecidos
- ❌ Optimizar rendimiento no solicitado
- ❌ NO SE DEBE CAMBIAR LA LOGICA SI LO QUE SE PIDE ES UN CAMBIO VISUAL.( POR EJ: CAMBIAR BOTONES DE LUGAR, MOVER COMPONENTES ETC.)

### Lo que SÍ se debe hacer:
- ✅ Implementar exactamente lo solicitado
- ✅ Mantener consistencia con el código existente
- ✅ Usar los patrones ya establecidos en el proyecto
- ✅ Solicitar clarificaciones cuando algo no esté claro
- ✅ Revisar el código antes de enviarlo

## 📋 Plantilla de Respuesta

### Antes de Implementar:
```
## Análisis del Requerimiento
- **Funcionalidad a implementar**: [DESCRIPCIÓN]
- **Archivos a modificar**: [LISTA DE ARCHIVOS]
- **Dependencias necesarias**: [SI APLICA]
- **Documentación requerida**: [SI APLICA]

## Plan de Implementación
1. [PASO 1]
2. [PASO 2]
3. [PASO 3]
```

### Después de Implementar:
```
## Resumen de Cambios
- **Archivos modificados**: [LISTA]
- **Funcionalidad implementada**: [DESCRIPCIÓN]
- **Pruebas sugeridas**: [LISTA DE VERIFICACIONES]

## Próximos Pasos
- [ACCIONES RECOMENDADAS O PENDIENTES]
```

## 🔍 Checklist de Revisión

Antes de completar cualquier implementación, verificar:

- [ ] ¿Se implementó exactamente lo solicitado?
- [ ] ¿Se modificaron solo los archivos necesarios?
- [ ] ¿El código mantiene el estilo existente?
- [ ] ¿Se conservaron los patrones establecidos?
- [ ] ¿No se introdujeron cambios innecesarios?
- [ ] ¿La funcionalidad nueva no rompe la existente?
- [ ] ¿Se documentaron los cambios si es necesario?

## 💡 Comunicación con el Usuario

### Cuando solicitar ayuda:
- Si el requerimiento no está claro
- Si se necesita documentación específica
- Si hay conflicto entre el requerimiento y el código existente
- Si se detectan problemas en el código base que impiden la implementación

### Formato de consultas:
```
"Para implementar [FUNCIONALIDAD] de manera correcta, necesito:
- [INFORMACIÓN/DOCUMENTACIÓN ESPECÍFICA]
- [CLARIFICACIÓN SOBRE X ASPECTO]

¿Puedes proporcionar esta información?"
```

## 🎯 Objetivos de Calidad

1. **Simplicidad**: Siempre elegir la solución más simple que funcione
2. **Consistencia**: Mantener coherencia con el código existente
3. **Precisión**: Implementar exactamente lo solicitado, ni más ni menos
4. **Estabilidad**: No romper funcionalidades existentes
5. **Claridad**: Código legible y bien documentado cuando sea necesario

---

**Nota**: Este documento debe ser consultado en cada implementación. Cualquier desviación de estas directrices debe ser explícitamente solicitada por el usuario.