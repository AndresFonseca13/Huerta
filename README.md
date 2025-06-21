# 🍹 Proyecto Huerta - Sistema de Gestión de Cócteles

Un sistema completo para la gestión de cócteles con backend en Node.js/Express y frontend en React.

## 🏗️ Estructura del Proyecto

```
proyecto-huerta/
├── backend/          # API REST con Node.js/Express
├── frontend/         # Aplicación React
├── docs/            # Documentación del proyecto
├── scripts/         # Scripts de deployment y utilidades
└── .github/         # GitHub Actions para CI/CD
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

1. **Clonar el repositorio**

```bash
git clone <tu-repositorio>
cd proyecto-huerta
```

2. **Configurar el backend**

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

3. **Configurar el frontend**

```bash
cd frontend
npm install
```

4. **Ejecutar en desarrollo**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📁 Estructura Detallada

### Backend (`/backend`)

- **API REST** para gestión de cócteles
- **Base de datos** PostgreSQL
- **Autenticación** JWT
- **Upload de imágenes** con Cloudinary

### Frontend (`/frontend`)

- **React 18** con Vite
- **Tailwind CSS** para estilos
- **Framer Motion** para animaciones
- **Axios** para comunicación con API

## 🔧 Scripts Disponibles

### Backend

```bash
cd backend
npm run dev          # Desarrollo con nodemon
npm run start        # Producción
npm run test         # Tests
```

### Frontend

```bash
cd frontend
npm run dev          # Desarrollo con Vite
npm run build        # Build para producción
npm run preview      # Preview del build
```

## 🚀 Deployment

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
# Servir archivos estáticos desde /dist
```

## 📝 Convenciones de Git

### Commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Documentación
- `style:` Cambios de estilo
- `refactor:` Refactorización
- `test:` Tests
- `chore:` Tareas de mantenimiento

### Branches

- `main` - Código de producción
- `develop` - Código en desarrollo
- `feature/nombre-feature` - Nuevas funcionalidades
- `hotfix/nombre-fix` - Correcciones urgentes

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **Tu Nombre** - _Desarrollo inicial_ - [TuGitHub](https://github.com/tugithub)

## 🙏 Agradecimientos

- Comunidad de React
- Tailwind CSS
- Framer Motion
- Express.js
