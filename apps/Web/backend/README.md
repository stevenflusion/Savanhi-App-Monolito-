# Admin-Marcas Backend (Node.js + Express)

Backend dedicado para la seccion Admin-Marcas. Usa `@repo/backend-core` para compartir auth, Supabase, health checks y manejo de errores con los otros backends.

## Preparacion

1. Copia variables de entorno:

```bash
cp .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Instala dependencias desde la raiz del monorepo:

```bash
pnpm install
```

## Ejecucion

Desarrollo (hot reload con `nodemon`):

```bash
pnpm --filter admin-marcas-backend dev
```

Produccion local:

```bash
pnpm --filter admin-marcas-backend start
```

## Endpoints base

- `GET /health`
- `GET /api/v1/ping`
- `GET /api/v1/admin/status`
- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me`
- `POST /auth/logout`

## Estructura

- `src/config`: configuracion y entorno.
- `src/routes`: rutas propias de Admin-Marcas.
- `@repo/backend-core`: auth, Supabase, middlewares base y health checks.

## Variables requeridas

Además de `NODE_ENV` y `PORT`, el backend necesita:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AUTH_JWT_SECRET`
- `CORS_ORIGINS`

## Esquema minimo de Supabase

Antes de usar el flujo completo, crea las tablas `roles` y `users` en Postgres con al menos:

- `id` uuid primary key
- `email` text unique not null
- `full_name` text not null
- `role` text not null
- `active` boolean default true
- `created_at` timestamp with time zone default now()
- `updated_at` timestamp with time zone default now()

El backend escribe en esa tabla cuando el usuario inicia sesion o se registra.
