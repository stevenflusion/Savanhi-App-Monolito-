# @repo/tailwind-config

Configuracion global de Tailwind para monorepo.

- `@repo/tailwind-config/web`: preset para apps web (Next.js).
- `@repo/tailwind-config/native`: preset base para apps React Native/Expo con NativeWind.

## Uso en apps web

1. Crear `tailwind.config.js` usando `presets: [require("@repo/tailwind-config/web")]`.
2. Crear `postcss.config.js` con `tailwindcss` y `autoprefixer`.
3. Importar un `globals.css` con `@tailwind base/components/utilities`.

## Uso en apps Expo (cuando existan)

1. Instalar en la app: `nativewind`, `tailwindcss` y dependencias Expo/React Native.
2. Crear `tailwind.config.js` en la app con `presets: [require("@repo/tailwind-config/native")]` y `content` apuntando a `app`/`src`.
3. Configurar Babel/Metro segun NativeWind para procesar `className` en React Native.
