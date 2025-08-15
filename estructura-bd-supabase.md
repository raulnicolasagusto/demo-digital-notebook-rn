# 📊 Estructura de Base de Datos - Supabase

> **Última actualización**: 14 de Agosto, 2025  
> **Proyecto**: Demo Digital Notebook React Native  
> **Propósito**: Documentación completa de la estructura de base de datos para referencia y mantenimiento

## 🗄️ **Resumen General**

La base de datos utiliza **PostgreSQL** con las siguientes características:
- **3 tablas principales** en el esquema `public`
- **Row Level Security (RLS)** habilitado en todas las tablas
- **Extensiones críticas**: uuid-ossp, pgcrypto, pg_graphql, pg_stat_statements, supabase_vault
- **Migraciones**: Sistema manual (sin migraciones automáticas detectadas)

---

## 📋 **Tablas del Sistema**

### 1. **`users`** - Gestión de Usuarios
**Propósito**: Almacena información de usuarios autenticados con Clerk

| Campo | Tipo | Nulo | Default | Única | Descripción |
|-------|------|------|---------|-------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | PK | Identificador único del usuario |
| `clerk_user_id` | varchar | No | - | ✅ | ID del usuario en Clerk (autenticación) |
| `email` | varchar | No | - | No | Email del usuario |
| `display_name` | varchar | Sí | - | No | Nombre para mostrar |
| `avatar_url` | text | Sí | - | No | URL del avatar del usuario |
| `created_at` | timestamp | Sí | `now()` | No | Fecha de creación |
| `updated_at` | timestamp | Sí | `now()` | No | Fecha de última actualización |

**Relaciones**:
- **1:N** con `notebooks` (un usuario puede tener múltiples cuadernos)

**Configuración**:
- ✅ **RLS habilitado**
- 📏 **Tamaño**: 64 kB
- 📊 **Registros estimados**: 1 vivo, 1 eliminado

---

### 2. **`notebooks`** - Cuadernos Digitales
**Propósito**: Almacena información de cuadernos creados por usuarios

| Campo | Tipo | Nulo | Default | Única | Descripción |
|-------|------|------|---------|-------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | PK | Identificador único del cuaderno |
| `user_id` | uuid | Sí | - | No | FK hacia users (propietario) |
| `title` | varchar | No | - | No | Título del cuaderno |
| `description` | text | Sí | - | No | Descripción del cuaderno |
| `cover_color` | varchar | Sí | `'#6D28D9'` | No | Color de portada por defecto |
| `cover_metadata` | jsonb | Sí | - | No | **🆕 Metadatos de portada** |
| `is_favorite` | boolean | Sí | `false` | No | Marca si es favorito |
| `created_at` | timestamp | Sí | `now()` | No | Fecha de creación |
| `updated_at` | timestamp | Sí | `now()` | No | Fecha de última actualización |

**Estructura de `cover_metadata`**:
```json
{
  "type": "preset_image" | "device_image" | "color",
  "value": "cover1" | "file://..." | "#6D28D9"
}
```

**Relaciones**:
- **N:1** con `users` (muchos cuadernos pertenecen a un usuario)
- **1:N** con `notebook_pages` (un cuaderno tiene múltiples páginas)

**Configuración**:
- ✅ **RLS habilitado**
- 📏 **Tamaño**: 88 kB
- 📊 **Registros estimados**: 4 vivos, 0 eliminados
- 💾 **Campo especial**: `cover_metadata` (jsonb) con comentario documentado

---

### 3. **`notebook_pages`** - Páginas de Cuadernos
**Propósito**: Almacena el contenido de canvas (dibujos y textos) de cada página

| Campo | Tipo | Nulo | Default | Única | Descripción |
|-------|------|------|---------|-------|-------------|
| `id` | uuid | No | `gen_random_uuid()` | PK | Identificador único de la página |
| `notebook_id` | uuid | Sí | - | No | FK hacia notebooks (cuaderno padre) |
| `page_number` | integer | No | `1` | No | Número de página dentro del cuaderno |
| `canvas_data` | jsonb | Sí | `'{"paths": [], "textElements": []}'` | No | **🎨 Datos del canvas** |
| `thumbnail_url` | text | Sí | - | No | URL de miniatura (futuro) |
| `created_at` | timestamp | Sí | `now()` | No | Fecha de creación |
| `updated_at` | timestamp | Sí | `now()` | No | Fecha de última actualización |

**Estructura de `canvas_data`**:
```json
{
  "paths": [
    {
      "path": "M10,20 L30,40 L50,60",
      "color": "#000000"
    }
  ],
  "textElements": [
    {
      "id": "1692901234567",
      "text": "Hola mundo",
      "x": 100,
      "y": 150,
      "width": 150,
      "height": 80
    }
  ]
}
```

**Relaciones**:
- **N:1** con `notebooks` (muchas páginas pertenecen a un cuaderno)

**Configuración**:
- ✅ **RLS habilitado**
- 📏 **Tamaño**: 64 kB
- 📊 **Registros estimados**: 2 vivos, 1 eliminado

---

## 🔗 **Diagrama de Relaciones**

```
users (1) ──────────────► (N) notebooks (1) ──────────────► (N) notebook_pages
  │                           │                                    │
  ├─ id (PK)                  ├─ id (PK)                          ├─ id (PK)
  ├─ clerk_user_id (UK)       ├─ user_id (FK)                    ├─ notebook_id (FK)
  ├─ email                    ├─ title                           ├─ page_number
  ├─ display_name             ├─ description                     ├─ canvas_data (JSONB)
  ├─ avatar_url               ├─ cover_color                     ├─ thumbnail_url
  ├─ created_at               ├─ cover_metadata (JSONB) 🆕       ├─ created_at
  └─ updated_at               ├─ is_favorite                     └─ updated_at
                              ├─ created_at
                              └─ updated_at
```

---

## 🔧 **Extensiones Habilitadas**

### **Extensiones Críticas (Instaladas)**
| Extensión | Esquema | Versión | Propósito |
|-----------|---------|---------|-----------|
| `uuid-ossp` | extensions | 1.1 | **Generación de UUIDs** (usado en PKs) |
| `pgcrypto` | extensions | 1.3 | **Funciones criptográficas** |
| `pg_graphql` | graphql | 1.5.11 | **API GraphQL automática** |
| `pg_stat_statements` | extensions | 1.11 | **Estadísticas de consultas** |
| `supabase_vault` | vault | 0.3.1 | **Gestión de secretos de Supabase** |
| `plpgsql` | pg_catalog | 1.0 | **Lenguaje procedural** (triggers, funciones) |

### **Extensiones Disponibles (No instaladas)**
- `postgis` - Funciones geoespaciales
- `vector` - Soporte para vectores (AI/ML)
- `http` - Cliente HTTP en base de datos
- `pg_cron` - Tareas programadas
- `pgjwt` - Tokens JWT
- Y 60+ extensiones más disponibles

---

## 🛡️ **Configuración de Seguridad**

### **Row Level Security (RLS)**
- ✅ **Habilitado** en todas las tablas
- 🔒 **Políticas**: Configuradas para autenticación Clerk
- 🎯 **Scope**: Los usuarios solo ven sus propios datos

### **Claves Foráneas**
```sql
-- notebooks.user_id → users.id
ALTER TABLE notebooks 
ADD CONSTRAINT notebooks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id);

-- notebook_pages.notebook_id → notebooks.id  
ALTER TABLE notebook_pages 
ADD CONSTRAINT notebook_pages_notebook_id_fkey 
FOREIGN KEY (notebook_id) REFERENCES notebooks(id);
```

---

## 📈 **Estadísticas de Uso**

| Tabla | Tamaño | Registros Vivos | Registros Eliminados |
|-------|---------|----------------|---------------------|
| `users` | 64 kB | 1 | 1 |
| `notebooks` | 88 kB | 4 | 0 |
| `notebook_pages` | 64 kB | 2 | 1 |
| **Total** | **216 kB** | **7** | **2** |

---

## 🔄 **Historial de Cambios**

### **Agosto 14, 2025**
- ✅ **Agregado**: Campo `cover_metadata` (jsonb) a tabla `notebooks`
- 📝 **Comentario**: "Metadatos de la portada del cuaderno (tipo: color, preset_image, device_image)"
- 🎯 **Propósito**: Almacenar información de portadas seleccionadas (imágenes preset, del dispositivo, o colores)

### **Cambios Previos** (estimados por estructura)
- ✅ **Creación inicial**: Tablas `users`, `notebooks`, `notebook_pages`
- ✅ **Configuración RLS**: Políticas de seguridad por usuario
- ✅ **Defaults**: Valores por defecto para timestamps y UUIDs
- ✅ **Relaciones**: Claves foráneas entre tablas

---

## 🧪 **Campos JSONB - Detalles Técnicos**

### **notebooks.cover_metadata**
**Tipos soportados**:
```typescript
type CoverMetadata = 
  | { type: "color", value: string }        // "#6D28D9"
  | { type: "preset_image", value: string } // "cover1", "cover2", etc.
  | { type: "device_image", value: string } // "file://..." URI
```

### **notebook_pages.canvas_data**
**Estructura de datos**:
```typescript
interface CanvasData {
  paths: Array<{
    path: string;    // SVG path string: "M10,20 L30,40"
    color: string;   // Color hex: "#000000"
  }>;
  textElements: Array<{
    id: string;      // Timestamp único: "1692901234567"
    text: string;    // Contenido: "Mi texto"
    x: number;       // Posición X: 100
    y: number;       // Posición Y: 150
    width?: number;  // Ancho: 150
    height?: number; // Alto: 80
  }>;
}
```

---

## 🚀 **Optimizaciones Futuras**

### **Índices Recomendados**
```sql
-- Para consultas por usuario (ya existe via FK)
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);

-- Para ordenar por fecha de actualización
CREATE INDEX IF NOT EXISTS idx_notebooks_updated_at ON notebooks(updated_at DESC);

-- Para búsquedas por tipo de portada
CREATE INDEX IF NOT EXISTS idx_notebooks_cover_type 
ON notebooks USING btree ((cover_metadata->>'type'));

-- Para consultas de páginas por cuaderno
CREATE INDEX IF NOT EXISTS idx_notebook_pages_notebook_id_page 
ON notebook_pages(notebook_id, page_number);
```

### **Triggers Recomendados**
```sql
-- Auto-actualizar updated_at en notebook_pages
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notebook_pages_updated_at
    BEFORE UPDATE ON notebook_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 📞 **Información de Contacto y Mantenimiento**

**Responsable**: Claude Code Assistant  
**Proyecto**: Demo Digital Notebook RN  
**Última revisión**: Agosto 14, 2025  
**Próxima revisión**: Al realizar cambios estructurales

---

> **Nota**: Este documento debe actualizarse cada vez que se realicen cambios en la estructura de la base de datos. Utilizar el MCP de Supabase para obtener información actualizada cuando sea necesario.