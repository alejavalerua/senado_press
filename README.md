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
git clone https://github.com/alejavalerua/senado_press.git
cd senado_press
npm install
```

### 2. Seed de datos iniciales

```bash
npm run seed
```
Esto crea usuarios de prueba y la lista de senadores.

### 3. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)
