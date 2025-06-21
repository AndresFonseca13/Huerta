# 📋 Guía de Versionado - Proyecto Huerta

## 🎯 Estrategia de Versionado

Utilizamos **Semantic Versioning (SemVer)** para el versionado de la aplicación:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Cambios incompatibles con versiones anteriores
- **MINOR**: Nuevas funcionalidades compatibles hacia atrás
- **PATCH**: Correcciones de bugs compatibles hacia atrás

## 🏷️ Estructura de Versiones

### Versión Actual: `1.0.0`

- **Backend**: `1.0.0`
- **Frontend**: `1.0.0`
- **Monorepo**: `1.0.0`

## 📝 Convenciones de Commits

### Formato de Commits

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Tipos de Commits

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Cambios de formato (espacios, comas, etc.)
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
feat(frontend): agregar modal de confirmación para crear cócteles
fix(backend): corregir validación de precio en createCocktail
docs: actualizar README con instrucciones de instalación
refactor(backend): simplificar lógica de búsqueda de ingredientes
```

## 🌿 Estrategia de Branches

### Branches Principales

- `main`: Código de producción (estable)
- `develop`: Código en desarrollo (integración)

### Branches de Trabajo

- `feature/nombre-feature`: Nuevas funcionalidades
- `bugfix/nombre-bug`: Correcciones de bugs
- `hotfix/nombre-fix`: Correcciones urgentes para producción
- `release/v1.1.0`: Preparación de releases

## 🚀 Proceso de Release

### 1. Preparación de Release

```bash
# Crear branch de release
git checkout -b release/v1.1.0 develop

# Actualizar versiones
npm version patch  # o minor/major según corresponda

# Commit de versiones
git commit -am "chore: bump version to 1.1.0"

# Merge a main
git checkout main
git merge release/v1.1.0

# Tag de release
git tag -a v1.1.0 -m "Release version 1.1.0"

# Merge a develop
git checkout develop
git merge release/v1.1.0

# Push de cambios
git push origin main develop
git push origin v1.1.0
```

### 2. Deployment Automático

- Los tags activan el deployment automático
- Se ejecutan tests y builds
- Se despliega a producción si todo pasa

## 📊 Changelog

### v1.0.0 (2024-06-21)

#### Added

- Sistema completo de gestión de cócteles
- API REST con Node.js/Express
- Frontend React con Tailwind CSS
- Upload de imágenes con Cloudinary
- Sistema de autenticación JWT
- Paginación y filtros
- Validación de formularios
- Manejo de errores mejorado

#### Features

- Crear, editar, eliminar cócteles
- Búsqueda de ingredientes y categorías
- Filtrado por categoría y tipo
- Interfaz responsiva y moderna
- Animaciones con Framer Motion

## 🔧 Scripts de Versionado

### Actualizar Versión

```bash
# Patch (1.0.0 -> 1.0.1)
npm version patch

# Minor (1.0.0 -> 1.1.0)
npm version minor

# Major (1.0.0 -> 2.0.0)
npm version major
```

### Ver Versión Actual

```bash
npm version
```

### Crear Release

```bash
# Script automatizado
./scripts/create-release.sh v1.1.0
```

## 🏷️ Tags y Releases

### Crear Tag

```bash
git tag -a v1.1.0 -m "Release version 1.1.0"
git push origin v1.1.0
```

### Listar Tags

```bash
git tag -l
```

### Ver Información de Tag

```bash
git show v1.1.0
```

## 🔄 Workflow de Desarrollo

### 1. Desarrollo de Feature

```bash
# Crear branch de feature
git checkout -b feature/nueva-funcionalidad develop

# Desarrollar y commitear
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push y crear Pull Request
git push origin feature/nueva-funcionalidad
```

### 2. Integración

```bash
# Merge a develop
git checkout develop
git merge feature/nueva-funcionalidad

# Push
git push origin develop
```

### 3. Release

```bash
# Crear release branch
git checkout -b release/v1.1.0 develop

# Actualizar versiones y changelog
# Crear Pull Request a main
```

## 📈 Monitoreo de Versiones

### Herramientas Recomendadas

- **GitHub Releases**: Para documentar releases
- **Conventional Changelog**: Para generar changelog automático
- **Semantic Release**: Para automatizar el proceso

### Métricas a Seguir

- Frecuencia de releases
- Tiempo entre releases
- Número de bugs por release
- Tiempo de resolución de bugs

## 🚨 Hotfixes

### Proceso de Hotfix

```bash
# Crear branch de hotfix desde main
git checkout -b hotfix/critical-bug main

# Corregir bug
git commit -m "fix: corregir bug crítico"

# Merge a main y develop
git checkout main
git merge hotfix/critical-bug
git tag -a v1.0.1 -m "Hotfix v1.0.1"

git checkout develop
git merge hotfix/critical-bug
```

## 📋 Checklist de Release

- [ ] Tests pasando
- [ ] Linting sin errores
- [ ] Documentación actualizada
- [ ] Changelog actualizado
- [ ] Versiones actualizadas
- [ ] Tag creado
- [ ] Deployment exitoso
- [ ] Notificación a stakeholders
