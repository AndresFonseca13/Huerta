# 🔧 Guía de Configuración de Variables de Entorno

Esta guía te ayudará a configurar tu archivo `.env` local para conectar con Supabase.

## 📋 Pasos para Obtener las Credenciales de Supabase

### 1. **SUPABASE_URL** y **SUPABASE_SERVICE_ROLE_KEY**

1. Ve a tu [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Settings** (⚙️) en el menú lateral
4. Haz clic en **API** en el submenú
5. Encontrarás:
   - **Project URL** → Esta es tu `SUPABASE_URL`
   - **service_role key** (secret) → Esta es tu `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ **IMPORTANTE**: Haz clic en "Reveal" para ver la clave completa
     - Esta clave tiene permisos completos, no la compartas públicamente

### 2. **DATABASE_URL** (Connection String de PostgreSQL)

1. En el mismo Dashboard de Supabase
2. Ve a **Settings** → **Database**
3. Busca la sección **Connection string**
4. Selecciona la pestaña **URI**
5. Copia la connection string completa
   - Formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
   - ⚠️ **IMPORTANTE**: Reemplaza `[PASSWORD]` con tu contraseña real de la base de datos
   - Si no conoces la contraseña, puedes resetearla en **Settings** → **Database** → **Database password**

### 3. **Verificar el Bucket de Storage**

1. Ve a **Storage** en el menú lateral de Supabase
2. Verifica que exista el bucket llamado `cocktail-images`
3. Si no existe, créalo:
   - Haz clic en "New bucket"
   - Nombre: `cocktail-images`
   - Marca como **Public** (para que las imágenes sean accesibles públicamente)
   - Haz clic en "Create bucket"

## 📝 Archivo .env de Ejemplo

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# ============================================
# CONFIGURACIÓN DE SUPABASE
# ============================================

# URL de tu proyecto Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co

# Service Role Key (clave de servicio con permisos completos)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# ============================================
# CONFIGURACIÓN DE BASE DE DATOS (SUPABASE POSTGRESQL)
# ============================================

# Connection string de Supabase PostgreSQL
# Reemplaza [PASSWORD] con tu contraseña real
DATABASE_URL=postgresql://postgres:tu-password@db.tu-proyecto.supabase.co:5432/postgres

# ============================================
# CONFIGURACIÓN DEL SERVIDOR
# ============================================

# Puerto del servidor (opcional, por defecto 3000)
PORT=3000

# Entorno de ejecución
NODE_ENV=development

# ============================================
# CONFIGURACIÓN DE CORS (OPCIONAL)
# ============================================

# URL del frontend en producción (para CORS)
FRONTEND_URL=http://localhost:5173

# ============================================
# CONFIGURACIÓN DE JWT (si la usas)
# ============================================

# JWT Secret para tokens de autenticación
JWT_SECRET=tu-jwt-secret-aqui
```

## 🚀 Pasos para Configurar y Probar Localmente

1. **Instalar dependencias:**
   ```bash
   cd backend
   npm install
   ```

2. **Crear el archivo .env:**
   ```bash
   # En la carpeta backend/
   touch .env
   # Luego edita el archivo con tus credenciales reales
   ```

3. **Verificar que el bucket existe:**
   - Ve a Supabase Dashboard → Storage
   - Asegúrate de que el bucket `cocktail-images` existe y es público

4. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

5. **Verificar la conexión:**
   - Deberías ver en la consola: "Conexión exitosa a la base de datos Supabase"
   - Si hay errores, revisa las variables de entorno

## ✅ Verificación de Configuración

El servidor mostrará en consola (en modo desarrollo) si las variables están configuradas:
- ✅ `SUPABASE_URL: Configurado`
- ✅ `SUPABASE_SERVICE_ROLE_KEY: Configurado`
- ✅ `DATABASE_URL: Configurado`

## 🔍 Solución de Problemas

### Error: "Bucket not found"
- Ve a Supabase Dashboard → Storage
- Crea el bucket `cocktail-images` y márcalo como público

### Error: "Error de autenticación con Supabase"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` sea la clave correcta (service_role, no anon)
- Asegúrate de copiar la clave completa

### Error: "Error al conectar a la base de datos"
- Verifica que `DATABASE_URL` tenga la contraseña correcta
- Asegúrate de que la contraseña no tenga caracteres especiales que necesiten encoding
- Si usas variables individuales, verifica que todas estén correctas

### Error: "Falta SUPABASE_URL"
- Verifica que el archivo `.env` esté en la carpeta `backend/`
- Verifica que no haya espacios alrededor del `=` en las variables
- Reinicia el servidor después de modificar `.env`

