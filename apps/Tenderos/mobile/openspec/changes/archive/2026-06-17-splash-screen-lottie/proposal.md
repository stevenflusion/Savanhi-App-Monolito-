# Proposal: Splash Screen Fix & Custom Lottie Animation

## Intent

Kill the white flash. Show the Lottie immediately while fonts load in parallel. Recover gracefully from font errors. Current splash is broken: no native config, fonts block Lottie, font errors freeze the app.

## Scope

### In Scope
- `app.json` — add `expo-splash-screen` config plugin with `backgroundColor: "#ffffff"`
- `app/_layout.tsx` — rewrite loading flow: module-scope `preventAutoHideAsync()`, dual readiness (fonts + animation), 10s timeout, font error fallback
- `src/components/SplashScreen.tsx` — strip module-scope `preventAutoHideAsync()`, remove `hide()`, rename `onReady`→`onFinish`

### Out of Scope
- Branded native splash image (Lottie IS the brand)
- Dark mode splash variants, Reanimated transitions, app icon

## Capabilities

### New Capabilities
- `splash-screen`: launch sequence — native splash config, Lottie display, parallel font loading, timeout safety, error recovery

### Modified Capabilities
None (`openspec/specs/` is empty — this is the first capability spec)

## Approach

Option A (from exploration): minimal native splash (solid white) → render Lottie on React mount → load fonts in background → show `<Stack />` when both are ready. 10s hard timeout. Font errors → system font fallback.

## Affected Areas

| Area | Impact | Change |
|------|--------|--------|
| `app.json` | Modified | Add config plugin to plugins array |
| `app/_layout.tsx` | Modified | Rewrite loading orchestration, dual state tracking |
| `src/components/SplashScreen.tsx` | Modified | Pure presentation component, no side effects |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Native rebuild required (config plugin) | Med | `npx expo prebuild` on first build; works in Expo Go |
| `preventAutoHideAsync()` timing if import order shifts | Low | Module scope in `_layout.tsx` + try/catch |
| Lottie 1400x500 crops on portrait screens | Med | User decision needed (see question round) |
| `expo-splash-screen` version mismatch | Low | ~31.0.13 confirmed for SDK 54 |

## Rollback Plan

Revert `app.json` (remove config plugin), `_layout.tsx`, and `SplashScreen.tsx` to git HEAD. Run `npx expo prebuild --clean` if native projects were modified.

## Dependencies

- `expo-splash-screen` ~31.0.13 (already installed)
- `lottie-react-native` v7.3.8 (already installed)
- `expo-font` (already installed via `useFonts`)

## Success Criteria

- [ ] No white flash on app launch — native splash covers boot
- [ ] Lottie animation visible immediately on React mount
- [ ] Fonts load during animation (parallel — confirmed via console timing)
- [ ] App transitions to `<Stack />` after both complete
- [ ] Font loading errors → system font fallback, no freeze
- [ ] 10s timeout forces app render regardless of animation state

## Proposal question round

Two unresolved product decisions:

1. **Lottie resize mode** — the animation is 1400x500 (landscape), phone screens are portrait:
   - `cover` — crops to fill (current), may cut off edges
   - `contain` — letterboxes with bars, shows full animation
   Which do you prefer?

2. **Native splash background** during the ~100-300ms JS boot:
   - Solid `#ffffff` — simple, clean
   - Subtle brand element (e.g., logo centered on white)
   Exploration recommends solid white since the Lottie IS the brand.
