# Project Architecture Exploration

> **Date**: 2026-06-17
> **Scope**: Full monorepo audit — Savanhi App
> **Focus**: `apps/Tenderos/mobile` (Expo SDK 54, RN 0.81.5, NativeWind v4, expo-router v6)
> **Artifact Mode**: openspec (standalone exploration)

---

## 1. Monorepo Architecture

### 1.1 Workspace Layout

```
Savanhi-App-Monolito-/
├── apps/
│   ├── Clients/        ← docs/ + share/ — SKELETON (READMEs only)
│   ├── Delivery/       ← docs/ + share/ — SKELETON (READMEs only)
│   ├── Tenderos/
│   │   ├── mobile/     ← ✅ FULLY FUNCTIONAL — Expo SDK 54 app
│   │   ├── web/        ← Next.js 14 — SKELETON (layout + page only)
│   │   ├── docs/       ← Next.js 14 — SKELETON (layout + page only)
│   │   └── share/      ← SKELETON (README only)
│   └── Web/
│       ├── backend/    ← ✅ FUNCTIONAL Express.js API
│       ├── web-enterprise/ ← ✅ FUNCTIONAL Next.js 14 (Clean Architecture)
│       ├── docs/       ← SKELETON (README only)
│       └── share/      ← SKELETON (README only)
├── packages/
│   ├── ui/             ← Web-only: Button, Card, Code (NOT Native)
│   ├── tailwind-config/← native.js + web.js presets
│   ├── typescript-config/ ← base.json, nextjs.json, react-library.json
│   └── eslint-config/  ← ESLint v9 flat configs
├── pnpm-workspace.yaml ← "apps/*/*" + "packages/*"
├── turbo.json          ← build, lint, check-types, dev tasks
└── package.json        ← pnpm@11.7.0, turbo@2.9.16, typescript@5.9.2
```

### 1.2 Workspace Resolution

- `pnpm-workspace.yaml` declares two glob patterns: `apps/*/*` and `packages/*`
- This resolves to: `apps/Tenderos/mobile`, `apps/Tenderos/web`, `apps/Tenderos/docs`, `apps/Web/backend`, `apps/Web/web-enterprise`, `packages/ui`, `packages/tailwind-config`, `packages/typescript-config`, `packages/eslint-config`
- **NOT resolved** (no second-level nesting): `apps/Clients/docs`, `apps/Clients/share`, `apps/Delivery/docs`, `apps/Delivery/share`, `apps/Web/docs`, `apps/Web/share`, `apps/Tenderos/share`

### 1.3 Turbo Tasks

| Task | Depends On | Notes |
|------|-----------|-------|
| `build` | `^build` | Outputs: `.next/**` (mobile/Expo not configured) |
| `lint` | `^lint` | ESLint v9 (flat config) |
| `check-types` | `^check-types` | `tsc --noEmit` |
| `dev` | — | `cache: false, persistent: true` |

**Gap**: `turbo.json` outputs target `.next/**` but does not account for Expo/metro builds.

### 1.4 App States Summary

| App | Tech | Status | What's Inside |
|-----|------|--------|--------------|
| Tenderos/mobile | Expo SDK 54, RN 0.81.5 | ✅ Functional | Full app: auth, products, inventory, dashboard |
| Tenderos/web | Next.js 14.2 | 🔶 Skeleton | `layout.tsx` + `page.tsx` only |
| Tenderos/docs | Next.js 14.2 | 🔶 Skeleton | `layout.tsx` + `page.tsx` only |
| Clients/* | — | 🔴 Empty | `docs/README.md`, `share/README.md` |
| Delivery/* | — | 🔴 Empty | `docs/README.md`, `share/README.md` |
| Web/backend | Express.js | ✅ Functional | Routes, controllers, services, middleware |
| Web/web-enterprise | Next.js 14.2 | ✅ Functional | Clean Architecture (domain/application/presentation) |
| Web/docs | — | 🔴 Empty | `README.md` |
| Web/share | — | 🔴 Empty | `README.md` |

---

## 2. Tenderos Mobile — Full Architecture

### 2.1 Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 54.0.35 |
| UI Runtime | React Native 0.81.5 |
| Navigation | expo-router ~6.0.24 (file-based) |
| Styling | NativeWind v4.1.23 (Tailwind CSS for RN) |
| CSS Engine | react-native-css-interop 0.2.5 |
| Animations | react-native-reanimated ~4.1.7, Animated API |
| Splash | Lottie (lottie-react-native ^7.3.8) |
| Fonts | expo-font, expo-splash-screen |
| Safe Area | react-native-safe-area-context 5.6.2 |
| Screens | react-native-screens ~4.16.0 |
| TypeScript | 5.9.2 |
| Language | All UI in Spanish (Argentina) |
| Test | **None** |

### 2.2 Route Structure (expo-router file-based)

```
app/
├── _layout.tsx             ROOT LAYOUT — Stack navigator
│   ├── SplashScreen (Lottie animation)
│   ├── Font loading (Montserrat)
│   └── AuthProvider wraps entire app
│
├── index.tsx               ENTRY — Auth redirect
│   └── isLoggedIn ? /(tabs) : /auth/login
│
├── auth/
│   ├── login.tsx           LOGIN — Pre-filled demo credentials
│   └── register.tsx        REGISTER — Name, email, password
│
└── (tabs)/
    ├── _layout.tsx         TAB LAYOUT — 3 tabs with custom NavBar
    │   ├── "Inicio"    (index)
    │   ├── "Productos" (orders)
    │   └── "Perfil"    (profile)
    ├── index.tsx            DASHBOARD / HOME
    ├── orders.tsx           PRODUCTS WORKSPACE
    └── profile.tsx          USER PROFILE + LOGOUT
```

### 2.3 Component Architecture (19 components, flat structure)

All components live in `src/components/` with no subdirectories:

```
src/components/
├── AuthProvider.tsx          Context provider for auth state
├── SplashScreen.tsx          Lottie animation splash
├── NavBar.tsx                Custom tab bar + icons
├── MobileTopBar.tsx          Screen title header
├── ProductsWorkspace.tsx     ⭐ THE BRAIN — product CRUD, sales, filtering
├── ProductForm.tsx           Create/edit product form
├── ProductCard.tsx           Product display card
├── AddProductCard.tsx        ⚠️ Legacy add-product (dark theme, duplicate)
├── ProductExpirationBadge.tsx Expiration status visual + logic
├── StockBadge.tsx            Stock level indicator
├── SearchBar.tsx             Search input
├── FilterTabs.tsx            Category filter pills
├── InventorySummaryCard.tsx  Inventory metrics display
├── DashboardStatCard.tsx     Dashboard stat boxes
├── TopProductsCard.tsx       Top-selling products list
├── QuickActionsCard.tsx      Quick action buttons
├── AlertsCard.tsx            Important alerts section
├── AlertCard.tsx             Individual alert item
└── EmptyState.tsx            Empty state placeholder
```

**Key observation**: `AddProductCard.tsx` is a dark-themed duplicate of the product creation form that is NOT used by `ProductsWorkspace` (which uses `ProductForm`). Possible leftover from a refactor.

### 2.4 Auth System

```
AuthProvider (React Context)
├── State: user (User | null), credentialStore (DEMO_USER)
├── DEMO_USER: { name: "Tendero Demo", email: "demo@tenderos.app", password: "123456" }
├── login(email, password) → boolean
│   └── Compares against credentialStore (in-memory)
├── register(name, email, password) → boolean
│   └── Overwrites credentialStore with new values, logs in immediately
└── logout() → sets user to null
```

**Critical characteristics**:
- All in-memory — on app refresh, user must log in again
- Single credential store (one user at a time)
- No token, no session, no cookie, no AsyncStorage
- No password hashing (plain text comparison)
- No backend API
- `register()` overwrites the only credential slot (multi-user impossible)
- Path-based redirect (`router.replace("/(tabs)")`)

### 2.5 State Management Approach

- **Local state**: `useState` in every component
- **Derived state**: `useMemo` for filtered products, grouped products, summary stats
- **Context state**: AuthProvider (React.createContext)
- **No global state library**: No Redux, Zustand, Jotai, Valtio, etc.
- **No persistence**: No AsyncStorage, MMKV, SQLite, or file storage
- **No loading states**: All operations are synchronous
- **No error boundaries**: Unhandled exceptions crash the app

### 2.6 Data Flow — Products

```
INITIAL_PRODUCTS (hardcoded array of 4 products)
├── "Arroz 1kg"       → Granos    → stock: 15, sold: 42, exp: 2026-12-15
├── "Aceite 900ml"    → Despensa  → stock: 6,  sold: 31, exp: 2026-06-03
├── "Gaseosa 500ml"   → Bebidas   → stock: 2,  sold: 27, (no exp)
└── "Galletas chocolate" → Snacks → stock: 0,  sold: 22, exp: 2026-05-28

ProductsWorkspace (manages state)
├── addProduct(payload)
│   ├── Creates { id: `p-${Date.now()}`, ...payload, sold: 0 }
│   └── Prepends to products array
├── registerSale()
│   ├── Selected product + quantity
│   ├── Validates stock ≥ quantity
│   └── Updates stock -= qty, sold += qty
├── filteredProducts
│   └── By search text (name + category) + category filter
├── grouped
│   └── Reduces filteredProducts by category
└── summary
    ├── total, inStock (>5), lowStock (1-5), outOfStock (≤0)
    ├── expiringSoon (≤7 days), expired (<0 days)
    └── Uses getExpirationStatus() helper
```

**Product type**:
```typescript
type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  sold: number;
  expirationDate?: string; // YYYY-MM-DD format
};
```

### 2.7 Data Flow — Dashboard (Hardcoded)

All dashboard values in `app/(tabs)/index.tsx` are **hardcoded strings**, NOT computed from products:

| Stat | Hardcoded Value |
|------|----------------|
| Ventas del día | $ 356.80 (+12% vs ayer) |
| Ganancia estimada | $ 97.20 (Margen promedio 27%) |
| Productos vendidos | 126 |
| Bajo stock | 3 (hardcoded, not from actual low-stock count) |
| Agotados | 2 (hardcoded, not from actual out-of-stock count) |
| Top products | Static array (Arroz 1kg/42, Aceite 900ml/31, Gaseosa 500ml/27) |
| Important alerts | Static array (3 items with hardcoded tones) |

### 2.8 Expiration Tracking

```typescript
getExpirationStatus(expirationDate?: string, nowDate: Date): ExpirationStatus
```

Algorithm:
1. Parse `YYYY-MM-DD` from string
2. Normalize today and expiration to midnight
3. Calculate `diffDays = Math.ceil((exp - today) / msPerDay)`
4. Return:
   - `diffDays < 0` → "Expirado" (rose)
   - `diffDays === 0` → "Vence hoy" (amber)
   - `diffDays ≤ 7` → "Por vencer" (orange)
   - `diffDays > 7` → "Vigente" (emerald)
   - No date → "Sin expiracion" (slate)

---

## 3. UI / Branding

### 3.1 Color Palette

| Role | Tailwind Classes | Hex Equivalent |
|------|-----------------|---------------|
| Page background | `bg-orange-50` | #fff7ed |
| Auth background | `bg-slate-950` | #020617 |
| Primary actions | `bg-emerald-600` | #059669 |
| Primary text | `text-emerald-800` | #065f46 |
| Card background | `bg-white` | #ffffff |
| Card border | `border-slate-200` | #e2e8f0 |
| Card background alt | `bg-slate-50` | #f8fafc |
| Danger | `bg-rose-500` / `text-rose-700` | #f43f5e / #be123c |
| Active tab | `bg-emerald-100` + `bg-emerald-600` dot | #d1fae5 / #059669 |
| Warning | `bg-amber-50` / `text-amber-700` | #fffbeb / #b45309 |
| Info | `bg-cyan-50` / `text-cyan-800` | #ecfeff / #155e75 |

### 3.2 Typography

- **Font Family**: Montserrat (loaded via `expo-font` from `assets/fonts/Montserrat.ttf`)
- **Scale**: `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px), `text-xl` (20px), `text-2xl` (24px)
- **Weights**: `font-semibold` consistently used for emphasis

### 3.3 Shapes & Spacing

- **Border radius**: `rounded-xl` (12px) for small containers, `rounded-2xl` (16px) for cards
- **Spacing**: Tailwind defaults (4px base), `gap-2` (8px) between items, `p-4`/`p-5` for card padding
- **Shadows**: `shadow-sm` on cards
- **Min height**: `min-h-[44px]` on all touchable elements (accessibility)

### 3.4 Animation Patterns

- **Screen entries**: `Animated.timing` with `useNativeDriver: true`
  - Fade: 0 → 1 over 280–320ms
  - Slide: 10–12px → 0 over 280–320ms
- **Splash**: Lottie animation (`LottieSplashScreen.json`) with `autoPlay`, `loop: false`
  - Uses `expo-splash-screen` `preventAutoHideAsync()` + `hide()` for native splash integration
- **No dark mode** support

---

## 4. Shared Packages

### 4.1 @repo/ui (`packages/ui`)

- **Status**: Web-only, NOT Native-compatible
- **Components**: Button (alert-based), Card (anchor tag), Code (inline code)
- **React version**: ^18.2.0 (conflicts with Tenderos/mobile which uses React 19.1.0)
- **Not used** by any app in the monorepo currently

### 4.2 @repo/tailwind-config (`packages/tailwind-config`)

- **native.js**: Presets: `nativewind/preset`, no custom theme extensions
- **web.js**: No presets, no custom theme extensions
- Clean, minimal — no custom tokens defined

### 4.3 @repo/typescript-config (`packages/typescript-config`)

- **base.json**: `strict: true`, `target: ES2022`, `module: NodeNext`, `isolatedModules: true`
- **nextjs.json**: Extends base, `module: ESNext`, `moduleResolution: Bundler`, `jsx: preserve`
- **react-library.json**: Extends base, `jsx: react-jsx`

### 4.4 @repo/eslint-config (`packages/eslint-config`)

- ESLint v9 flat config format
- **base.js**: Recommended rules, TypeScript ESLint, Turbo plugin, Prettier
- **next.js**: Base + React + React Hooks + Next.js plugin
- **react-internal.js**: Base + React + React Hooks (for shared packages)

---

## 5. Code Quality & Architecture Gaps

### 5.1 Critical Gaps

| Gap | Impact | Details |
|-----|--------|---------|
| **No tests** | Blocking for refactoring | Zero test files, zero test dependencies across entire monorepo |
| **No CI pipeline** | No quality gates | No GitHub Actions, no build verification, no lint gates |
| **Mock auth** | Security theater | Plain text password, single in-memory user, no session persistence |
| **No API layer** | No real data | No fetch/axios, no HTTP client, no API service abstraction |
| **In-memory only** | Data loss on refresh | Products, credentials, state — all gone |
| **Hardcoded dashboard** | Misleading UX | Stats are fake strings, not computed from actual products |

### 5.2 Moderate Gaps

| Gap | Impact | Details |
|-----|--------|---------|
| **No error boundaries** | Crash vulnerability | Any runtime error crashes the app |
| **No loading states** | Synchronous assumptions | Works now (all in-memory), will break when async added |
| **No persistent storage** | Session loss | No AsyncStorage, MMKV, SQLite, or file-based storage |
| **Flat component dir** | Poor scalability | 19 files in one directory, no hierarchy |
| **Duplicate add form** | Maintenance risk | `AddProductCard.tsx` (unused) vs `ProductForm.tsx` (in use) |
| **`as never` casts** | Type unsafety | Route redirects use `as never` to bypass type checking |
| **No form validation lib** | Manual error handling | Raw TextInput + useState for all forms |
| **@repo/ui incompatible** | Wasted package | React 18 components, not usable with React 19 Native app |
| **No route type safety** | Runtime redirects | typedRoutes: true configured but no typed route helpers |
| **Backend skeleton** | No real API | Only health route exists |

### 5.3 Minor Observations

- No internationalization (all UI in Spanish, hardcoded strings)
- No dark mode support
- No accessibility audit (basic `accessibilityRole`/`accessibilityLabel` on some elements)
- Product IDs use `Date.now()` (not UUID) — collisions possible with rapid adds
- No input sanitization beyond `.trim()` and `.toLowerCase()`
- `FilterTabs` validates with comparison `===` against string literals
- No SEARCH/DEBOUNCE on SearchBar — filters on every keystroke immediately
- Tab icons are Unicode characters (⌂, ▦, ◉) — not SVGs or custom fonts
- No .env files or environment configuration in mobile app

---

## 6. Navigation & Flow Diagrams

### 6.1 App Launch Flow

```
App Start
  ↓
Root Layout (_layout.tsx)
  ├── Load Montserrat font (expo-font)
  ├── If not loaded → return null (blank screen)
  ├── If loaded & splash not done → SplashScreen (Lottie)
  └── If loaded & splash done → AuthProvider → Stack nav
                                  ↓
                            index.tsx
                                  ↓
                      isLoggedIn? ──NO──→ /auth/login
                          │
                         YES
                          ↓
                     /(tabs) → Tab Navigator
                          │
                    ┌──────┼──────┐
                    ↓      ↓      ↓
                 Inicio  Productos  Perfil
```

### 6.2 User Registration Flow

```
Register Screen
  ├── Fields: name, email, password
  ├── "Registrarme" button
  ├── Calls register(name, email, password)
  │   ├── Validation: name required, email required, password ≥ 6 chars
  │   ├── Updates credentialStore (IN-MEMORY)
  │   └── Sets user state → isLoggedIn = true
  └── router.replace("/(tabs)")
```

### 6.3 Product Lifecycle

```
PRODUCT CREATION
  ProductForm → onSubmit → addProduct(payload)
    ├── Generates ID: `p-${Date.now()}`
    ├── Sets sold: 0
    └── Prepends to products[]

PRODUCT SALE
  Sale Mode → Select product → Set quantity → Confirm
    ├── Validates stock ≥ quantity
    ├── Decrements stock, increments sold
    └── Shows feedback message

PRODUCT FILTERING
  Products[] → search text + category filter
    → filteredProducts (useMemo)
    → grouped by category (useMemo)
    → ProductCard for each
```

---

## 7. Architecture Decisions (ADRs Implicit)

1. **File-based routing over programmatic** — expo-router chosen for convention-over-configuration
2. **Tailwind over StyleSheet** — NativeWind v4 for consistent styling
3. **Context over state lib** — Auth state via React Context, not external library
4. **No persistence layer** — MVP decision, data lives only in memory
5. **No test infrastructure** — Not yet established (acknowledged in OpenSpec config)
6. **Custom tab bar** — Rolled own NavBar instead of default expo-router tabs
7. **Single credential store** — auth system supports one user at a time
8. **Workspace resolution pattern** — `apps/*/*` instead of `apps/**` to avoid nested workspace issues
9. **No @repo/ui usage** — shared UI components are web-only, not compatible with RN

---

## 8. Risks

1. **Zero test coverage**: Any refactoring or feature addition is blind — no safety net
2. **In-memory data model**: Every app restart loses all state. This is the single biggest UX problem
3. **Synchronous-only architecture**: The codebase assumes no async operations. Adding persistence or an API will require restructuring every stateful component
4. **Hardcoded dashboard creates false expectations**: Users will expect real stats when they see "Ventas del día: $356.80"
5. **No CI means no regression detection**: Code can break without anyone noticing until runtime
6. **Auth is not real**: The mock system neither secures the app nor models real authentication flows
7. **React version mismatch**: Tenderos/mobile uses React 19.1.0 while @repo/ui depends on React ^18.2.0 (not currently an issue since mobile doesn't use @repo/ui, but a version conflict would arise if it tried)

---

## 9. Next Recommended Steps

1. **Persist auth state** — Add expo-secure-store or AsyncStorage before any other feature work
2. **Persist products** — Add MMKV or SQLite for product data survival across sessions
3. **Add test infrastructure** — Vitest + React Native Testing Library as foundation
4. **Create API layer** — Replace in-memory operations with repository pattern (even if local-storage-backed)
5. **Fix the dashboard** — Compute real stats from the products array instead of hardcoded strings
6. **Remove dead code** — Delete `AddProductCard.tsx` (replaced by `ProductForm.tsx`)
7. **Fix type safety** — Eliminate `as never` casts by properly typing routes
8. **Add error boundaries** — Wrap each tab in an ErrorBoundary
9. **Organize components** — Introduce subdirectories (auth/, products/, dashboard/, shared/)
10. **Set up CI** — GitHub Actions with lint, type-check, and (eventually) test gates

---

## 10. Artifact Details

- **Exploration type**: Standalone (no change name)
- **Files read**: 45+ files across the monorepo
- **Validated by reading actual code**: Yes — all findings are based on real file content, not inference
- **OpenSpec SDD context**: Initialized (config.yaml exists, no specs yet)
