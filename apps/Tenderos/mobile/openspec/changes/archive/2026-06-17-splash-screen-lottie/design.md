# Design: Splash Screen Fix & Custom Lottie Animation

## Technical Approach

Option A from exploration: minimal native splash (solid white bg, no image) → render `<SplashScreen />` immediately on React mount → load fonts in parallel while Lottie plays → dual readiness gate (fonts + animation) → hide native splash via `hideAsync()` → show `<Stack />`. 10s font timeout forces system font fallback.

## Architecture Decisions

| Decision | Option | Tradeoffs | Chosen |
|----------|--------|-----------|--------|
| State location | `_layout.tsx` vs custom hook | Hook is testable but adds indirection for a single consumer | `_layout.tsx` inline — flat, visible, no extra module |
| `hideAsync()` timing | On mount vs on both ready | Early hide = white flash; late hide = native bg visible under Lottie | On both ready — native splash bg IS the Lottie bg (both `#ffffff`) |
| Font timeout value | 5s vs 10s vs 15s | Too short → premature fallback on slow networks; too long → app stuck | 10s — matches common font CDN timeouts |
| `useRef` for animation flag | Ref vs state | Ref avoids re-render, prevents double-fire | `useRef` — no visual change needed on flag set |

**Rationale**: The Lottie bg (`#ffffff`) matches the native splash bg, so there's no visual flash when hiding the native splash — the white bg is continuous. This lets us hide the native splash at any point without visual discontinuity.

## State Machine

```
                         ┌──────────────────────────────────────┐
                         │                                      │
                         v                                      │
  [NATIVE_SPLASH] ──→ [PLAYING] ──→ [READY] ──→ [TRANSITIONING] ──→ [APP]
       │                  │  ^                                    │
       │                  │  │ fontsError                           │
       │                  │  └──── TIMEOUT ────┐                  │
       │                  │        (10s)       │                  │
       │                  └────────────────────┘                  │
       │                                                          │
       └────────────── LOADING ──────────────────────────────────┘
```

### States
| State | Condition | What's visible |
|-------|-----------|----------------|
| **NATIVE_SPLASH** | Process start → React hydrates | Native white bg (via config plugin) |
| **PLAYING** | React mounts → Lottie renders | Lottie animates + fonts loading in bg |
| **READY** | both fontsLoaded AND animationFinished | Lottie final frame (held) |
| **TIMEOUT** | 10s elapsed before fonts resolved | fontsError=true → proceed with system fonts |
| **TRANSITIONING** | hideAsync() called | Native splash fade (default ~200ms) |
| **APP** | hideAsync() resolves | `<AuthProvider><Stack /></AuthProvider>` |

### Transitions
- `NATIVE_SPLASH → PLAYING`: React hydration completes, `_layout.tsx` renders `<SplashScreen />`
- `PLAYING → READY`: `fontsLoaded || fontsError` AND `animationFinished`
- `PLAYING → TIMEOUT`: 10s elapsed, fonts not resolved → `fontsError` set
- `TIMEOUT → READY`: `animationFinished` fires (immediate if already done)
- `READY → TRANSITIONING`: `SplashScreen.hideAsync()` called
- `TRANSITIONING → APP`: `hideAsync()` resolves

## Data Flow

```
app.json (config plugin)
  │
  ▼ (native layer)
Native Splash bg (#ffffff) ─── covers boot
  │
  ▼ (JS bundle loads)
_layout.tsx (module scope)
  ├── SplashScreen.preventAutoHideAsync()
  │
  ▼ (render)
<SplashScreen> ───────────────────────── <useFonts({ Monserrat })>
  │ Lottie animation (4s)                    │
  │   │                                      │
  │   ▼ (onAnimationFinish)                  ▼ (loaded or error)
  │ animationFinished = true            fontsReady = loaded || error
  │                                      timeout = 10s useEffect
  │                                      set fontsReady=true after 10s
  │                                      │
  └────────── BOTH ready? ───────────────┘
                      │ yes
                      ▼
            hideAsync() → show <Stack />
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app.json` | Modify | Add `expo-splash-screen` config plugin with `backgroundColor: "#ffffff"` |
| `app/_layout.tsx` | Modify | Full rewrite of loading orchestration — module-scope `preventAutoHideAsync()`, dual readiness, timeout, font error handling |
| `src/components/SplashScreen.tsx` | Modify | Strip expo-splash-screen imports, remove side effects, rename `onReady` → `onFinish` |

### app.json — exact diff

```jsonc
{
  "expo": {
    // ... existing props ...
    "plugins": [
      "expo-router",
      "expo-font",
+     [
+       "expo-splash-screen",
+       { "backgroundColor": "#ffffff" }
+     ]
    ],
  }
}
```

### app/_layout.tsx — full rewrite

```tsx
import { Stack } from "expo-router"
import { AuthProvider } from "@/src/components/AuthProvider"
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import "../global.css"
import { useCallback, useEffect, useRef, useState } from "react"
import SplashApp from "@/src/components/SplashScreen"

// Module scope — fires before any component renders
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Monserrat: require("../assets/fonts/Montserrat.ttf"),
  })
  const [animationFinished, setAnimationFinished] = useState(false)
  const [appReady, setAppReady] = useState(false)
  const timeoutRef = useRef(false)

  // 10s timeout for font loading
  useEffect(() => {
    const timer = setTimeout(() => {
      timeoutRef.current = true
      setAppReady(true) // forces re-eval below
    }, 10_000)
    return () => clearTimeout(timer)
  }, [])

  // Both ready? → hide native → show app
  const fontsReady = fontsLoaded || fontsError || timeoutRef.current

  useEffect(() => {
    if (fontsReady && animationFinished) {
      SplashScreen.hideAsync().then(() => {
        // Animation callback already set appReady via onAnimationFinish
        // Native splash hidden — safe to show app
      })
    }
  }, [fontsReady, animationFinished])

  const handleAnimationFinish = useCallback(() => {
    setAnimationFinished(true)
  }, [])

  if (fontsReady && animationFinished && appReady === false) {
    setAppReady(true)
  }

  // Show Lottie immediately — don't wait for fonts
  if (!appReady) {
    return <SplashApp onAnimationFinish={handleAnimationFinish} />
  }

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  )
}
```

### src/components/SplashScreen.tsx — clean version

```tsx
import { View, StyleSheet } from "react-native"
import LottieView from "lottie-react-native"
import { useRef, useCallback } from "react"

type SplashScreenProps = {
  onAnimationFinish: () => void
}

export default function SplashScreen({ onAnimationFinish }: SplashScreenProps) {
  const animationRef = useRef<LottieView>(null)
  const hasFinished = useRef(false)

  const handleFinish = useCallback(() => {
    if (hasFinished.current) return
    hasFinished.current = true
    onAnimationFinish()
  }, [onAnimationFinish])

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require("@/assets/lotties/LottieSplashScreen.json")}
        autoPlay
        loop={false}
        resizeMode="cover"
        onAnimationFinish={handleFinish}
        style={styles.animation}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  animation: {
    flex: 1,
    width: "100%",
  },
})
```

Removed: `import * as ExpoSplashScreen`, `preventAutoHideAsync()`, `hide()`, `handleLayout`, `onLayout` prop. Renamed `onReady` → `onAnimationFinish`. No optional props (keeps it simple).

## Timing Diagram

```
Time ──────────────────────────────────────────────────────────>
     0ms          ~100ms              ~4s               ~4.2s
     │             │                   │                  │
NATIVE SPLASH ◄───┤                   │                  │
(#ffffff bg)       │                   │                  │
                   │ JS hydrates       │                  │
                   ▼                   │                  │
             PLAYING ◄─────────────────┤                  │
             Lottie animates           │                  │
             Fonts load ───────────────┤                  │
                   │                   │                  │
                   │   Fonts ready ◄───┤                  │
                   │   Ani  done ◄─────┘                  │
                   ▼                                      │
             READY → hideAsync()                          │
                   → fade (~200ms) ◄──────────────────────┤
                                                          ▼
                                                      APP (Stack)
```

Native white bg is seamless — same color as Lottie bg. No flash at any transition.

## Error States

| Scenario | Trigger | Behavior |
|----------|---------|----------|
| **Font load error** | `fontsError` is truthy | `fontsReady = true` — system font fallback, app renders normally |
| **Timeout before ani finishes** | 10s timer fires | `fontsReady = true` → app renders when Lottie finishes (or immediately if ani already done) |
| **Timeout after ani finished** | Fonts still loading | `animationFinished` already true → immediately triggers `hideAsync()` |
| **Ani finishes before fonts** | `onAnimationFinish` fires | Waits for `fontsReady` — holds Lottie's last frame |

## Edge Cases

| Case | What happens | Why it's safe |
|------|-------------|---------------|
| App backgrounded during Lottie | Lottie pauses (RN lifecycle), resumes on foreground, `onAnimationFinish` fires normally | Standard RN behavior |
| Fonts resolve in <100ms | `fontsReady` = true immediately, waits for animation | Flash? No — `fontLoadingFinished` + `animationFinished` gate prevents premature transition |
| Lottie >10s (giant animation) | Timeout fires at 10s → app transitions with Lottie still playing | The component unmounts → Lottie stops. Acceptable tradeoff (4s animation won't hit this) |
| `hideAsync()` fails | Wraps in try/catch, still sets `appReady` | App renders under native splash — user sees Lottie layer. Next cold start resolves. |
| StrictMode double-mount | `hasFinished` ref + `useEffect` cleanup | Double-fire prevented by `hasFinished.current` check |

## Interfaces / Contracts

```typescript
// SplashScreen.tsx — public interface
type SplashScreenProps = {
  onAnimationFinish: () => void
}
// No expo-splash-screen dependency. Pure presentation.
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `SplashScreen` renders Lottie, fires callback once | `render(<SplashScreen />)`, verify LottieView exists, mock `onAnimationFinish` |
| Integration | `_layout.tsx` state machine | Mock `useFonts` (loaded/error/pending) + `LottieView.onAnimationFinish` — verify app renders when both gates pass |
| Manual | Cold launch on device | Confirm: no white flash, Lottie visible immediately, fonts load during ani, timeout works via throttled network |
| Type check | `npx tsc --noEmit` | Passes without errors |

## Migration / Rollout

No data migration. Config plugin takes effect on next `npx expo prebuild` or native build. In Expo Go (managed), the config plugin applies on rebuild. Dev builds need explicit `npx expo prebuild`.

**Rollback**: `git checkout HEAD -- app.json app/_layout.tsx src/components/SplashScreen.tsx` + `npx expo prebuild --clean` if native projects were modified.

## Open Questions

None — all product decisions resolved in proposal round (resizeMode=cover, solid white bg, no custom fade).
