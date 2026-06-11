# Admin-Marcas Backend (Node.js + Express)

Backend base con arquitectura modular (`routes/controllers/services`) y manejo centralizado de errores.

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

## Estructura

- `src/config`: configuracion y entorno.
- `src/routes`: definicion de rutas.
- `src/controllers`: capa HTTP.
- `src/services`: logica de negocio.
- `src/middlewares`: not found + error handler.
