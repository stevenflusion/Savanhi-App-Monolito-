# Tasks: Splash Screen Fix & Custom Lottie Animation

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~55 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Task Breakdown

### T1: Configure native splash in app.json
- **Files**: `app.json`
- **AC**: `expo-splash-screen` plugin added to `plugins` array with `backgroundColor: "#ffffff"` and no image property. Next `npx expo prebuild` produces native config with solid white bg.
- **Deps**: None
- **Effort**: S
- **Status**: ✅ Complete

### T2: Refactor SplashScreen.tsx to pure presentation component
- **Files**: `src/components/SplashScreen.tsx`
- **AC**: Remove `import * as ExpoSplashScreen` and `preventAutoHideAsync()`. Remove `ExpoSplashScreen.hide()` from `handleAnimationFinish`. Remove `handleLayout`/`onLayout`. Rename `onReady` → `onAnimationFinish`. Wrap export with `React.memo()`. Single-fire guard via `hasFinished` ref preserved.
- **Deps**: None
- **Effort**: S
- **Status**: ✅ Complete

### T3: Rewrite _layout.tsx loading orchestration
- **Files**: `app/_layout.tsx`
- **AC**: Module-scope `SplashScreen.preventAutoHideAsync()`. `useFonts` hook runs in parallel with immediate `<SplashScreen />` render. `useRef` timeout fires at 10s. Dual gate (`fontsReady && animationFinished`) triggers `SplashScreen.hideAsync()` then renders `<AuthProvider><Stack />`. Font errors set `fontsReady = true` → system font fallback. `useRef` flags prevent setState after unmount.
- **Deps**: T2 (depends on new `onAnimationFinish` prop)
- **Effort**: M
- **Status**: ✅ Complete

### T4: TypeScript type check
- **Files**: `app.json`, `app/_layout.tsx`, `src/components/SplashScreen.tsx`
- **AC**: `npx tsc --noEmit` passes with zero errors.
- **Deps**: T1, T2, T3
- **Effort**: S
- **Status**: ⚠️ Partial — all errors are pre-existing `Cannot find module` due to missing `node_modules` (not installed in this environment). Zero code-level type errors from changes. Run `npm install` (or workspace install) and retry.

### T5: Manual verification on device/emulator
- **Files**: N/A
- **AC**: Cold launch → no white flash, Lottie visible immediately, fonts load during animation, app transitions when both ready. Throttled network → 10s timeout triggers system font. Corrupt font file → graceful fallback, no freeze.
- **Deps**: T1, T2, T3, T4
- **Effort**: S
- **Status**: ⏳ Manual

## Implementation Order

T1 (app.json) + T2 (SplashScreen.tsx) are independent — can be done in parallel. T3 (_layout.tsx) depends on T2's new API. T4 runs after all code changes. T5 is final manual verification.

## Manual Verification Instructions

### Prerequisites
1. Install dependencies: run the workspace package manager from monorepo root
2. For native builds: run `npx expo prebuild` to apply config plugin changes

### Verification Steps

#### 1. Cold launch on device/emulator
1. Kill the app completely
2. Open the app
3. **Expected**: No white flash — native splash shows solid white bg, then Lottie animation plays immediately, fonts load in background, app transitions to login/tabs when animation finishes

#### 2. Throttled network (font timeout)
1. Enable network throttling (Slow 3G) in dev tools
2. Kill and reopen the app
3. **Expected**: Lottie plays, the 10s timeout fires, system font fallback kicks in, app transitions when animation finishes (or immediately if animation already done)

#### 3. Lottie resize mode
1. Open the app
2. **Expected**: Lottie animation fills the entire screen (resizeMode="cover") without letterboxing

#### 4. Font error simulation
1. Temporarily rename/corrupt the Montserrat.ttf file
2. Kill and reopen the app
3. **Expected**: App still loads with system fonts, no freeze or crash

### Rollback
If issues occur:
```bash
git checkout HEAD -- app.json app/_layout.tsx src/components/SplashScreen.tsx
npx expo prebuild --clean  # if native projects modified
```
