# Senado Press

Plataforma de red social para periodistas estudiantiles del **Modelo de Senado BIMUN 2026**. Los estudiantes publican despachos, observaciones, críticas y preguntas dirigidas a senadores y colegas, con moderación automática y panel de control para el Secretario General.

## Arquitectura

El proyecto sigue **Clean Architecture** con capas separadas:

```
src/
├── domain/           # Entidades, interfaces de repositorios y servicios
├── application/      # Casos de uso (login, publicar, moderar, reaccionar)
├── infrastructure/   # Supabase, moderación, auth JWT, DI container
└── presentation/     # Componentes React y páginas Next.js
```

**Stack:** Next.js 15 · TypeScript · Tailwind CSS 4 · Supabase (PostgreSQL + Storage)

## Funcionalidades

- Login exclusivo para periodistas y administrador (Samuel Lugo)
- Publicación de despachos con etiquetas (Debate, Pregunta, Crítica, Observación, Sesión)
- Adjuntar imágenes en publicaciones
- Reacciones like/dislike
- Moderación automática de lenguaje inadecuado
- Panel de moderación para aprobar, rechazar o bloquear mensajes
- Filtros de contenido (Todo, Debate, Sesión, Preguntas, Senadores)
- Panel dinámico del estado del Senado
- Barra EN VIVO con tema actual del debate
- Admin: editar tema, tiempos y métricas de sesión

## Configuración

### 1. Clonar e instalar

```bash
git clone <tu-repo>
cd senado_press
npm install
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En **SQL Editor**, ejecuta el contenido de `supabase/migrations/001_initial_schema.sql`
3. En **Storage**, crea un bucket llamado `post-images` (público)
4. Copia las credenciales del proyecto

### 3. Variables de entorno

```bash
cp .env .env
```

Edita `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
JWT_SECRET=genera-un-secreto-seguro-de-32-caracteres-minimo
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Seed de datos iniciales

```bash
npm run seed
```

Esto crea usuarios de prueba y la lista de senadores.

### 5. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Credenciales de prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Admin (Samuel Lugo) | `samuel` | `secretario2026` |
| Periodista 1 | `periodista1` | `prensa2026` |
| Periodista 2 | `periodista2` | `prensa2026` |
| Periodista 3 | `periodista3` | `prensa2026` |
| Periodista 4 | `periodista4` | `prensa2026` |
| Periodista 5 | `periodista5` | `prensa2026` |

> Cambia las contraseñas antes del evento real.

## Mesa Directiva (BIMUN 2026)

- **Presidente:** Sophia
- **Vicepresidenta:** Valeria
- **Secretario General:** Samuel Lugo

## Créditos

Desarrollado por **Alejandra Valencia**

## Estructura de commits sugerida

Para subir a GitHub de forma organizada:

```bash
# Commit 1: Scaffold y configuración
git add package.json tsconfig.json next.config.ts .gitignore .env
git commit -m "chore: inicializar proyecto Next.js con TypeScript y Tailwind"

# Commit 2: Arquitectura y dominio
git add src/domain/ src/application/ src/infrastructure/
git commit -m "feat: implementar clean architecture con capas domain, application e infrastructure"

# Commit 3: API routes
git add src/app/api/
git commit -m "feat: agregar API routes para auth, posts, moderación y senado"

# Commit 4: UI
git add src/presentation/ src/app/
git commit -m "feat: construir interfaz de periodistas, feed y panel de administración"

# Commit 5: Supabase y scripts
git add supabase/ scripts/
git commit -m "feat: agregar migraciones Supabase y script de seed"

# Commit 6: Documentación
git add README.md
git commit -m "docs: agregar README con instrucciones de configuración"
```