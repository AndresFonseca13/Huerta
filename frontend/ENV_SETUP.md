# 🔧 Configuración de Variables de Entorno - Frontend

## Configuración de la URL del Backend

El frontend se conecta al backend usando la variable de entorno `VITE_API_URL`.

### Para Desarrollo Local

En desarrollo local, el proxy de Vite (configurado en `vite.config.js`) redirige automáticamente las peticiones a `/api` hacia `http://localhost:3000`.

**No necesitas configurar nada** - funciona automáticamente.

### Para Producción (Vercel)

Para que el frontend se conecte al backend en Vercel, necesitas crear un archivo `.env.production` en la carpeta `frontend/`:

```env
VITE_API_URL=https://huerta-backend.vercel.app/api
```

### Pasos para Configurar en Vercel

1. **Crear archivo `.env.production` en `frontend/`:**

```bash
cd frontend
touch .env.production
```

2. **Agregar la siguiente línea al archivo:**

```env
VITE_API_URL=https://huerta-backend.vercel.app/api
```

3. **Configurar en Vercel Dashboard:**

   - Ve a tu proyecto en Vercel
   - Settings → Environment Variables
   - Agrega:
     - **Name:** `VITE_API_URL`
     - **Value:** `https://huerta-backend.vercel.app/api`
     - **Environment:** Production (y Preview si quieres)

4. **Hacer build y deploy:**

```bash
npm run build
```

### Verificación

Después del deploy, verifica que las peticiones se estén haciendo a la URL correcta:
- Abre las DevTools del navegador (F12)
- Ve a la pestaña Network
- Busca peticiones que empiecen con `/api` o `https://huerta-backend.vercel.app/api`

