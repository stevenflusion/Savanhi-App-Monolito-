# Splash Screen Specification

## Purpose

Define the launch sequence for Tenderos mobile: native splash config, Lottie animation display, parallel font loading, timeout safety, and error recovery — eliminating the white flash and font-load freeze.

## Requirements

### Requirement: R1 — Native Splash Configuration

The native splash MUST show solid white (`#ffffff`) with NO image.

#### Scenario: Cold launch shows white native splash

- GIVEN the app launches cold
- WHEN the native splash renders
- THEN the background MUST be `#ffffff`
- AND no static image SHALL appear

### Requirement: R2 — Module-Scope Auto-Hide Prevention

`SplashScreen.preventAutoHideAsync()` MUST be called at module scope in `app/_layout.tsx`, not inside a component.

#### Scenario: Native splash persists until JS is ready

- GIVEN the app has launched
- WHEN the native module loads
- THEN the native splash SHALL remain visible until `hideAsync()` is explicitly called

### Requirement: R3 — Immediate Lottie Render

The app MUST render `<SplashScreen />` immediately on React mount, without waiting for fonts.

#### Scenario: Lottie plays during font load

- GIVEN React mounts
- WHEN `_layout.tsx` renders
- THEN `<SplashScreen />` MUST display the Lottie immediately
- AND fonts SHALL load in parallel

#### Scenario: Lottie resize mode is cover

- GIVEN the Lottie asset is 1400x500 (landscape)
- WHEN displayed on a portrait phone screen
- THEN `resizeMode="cover"` MUST crop edges to fill the screen

### Requirement: R4 — Dual Readiness Gate

The app MUST transition to `<AuthProvider><Stack /></AuthProvider>` only when BOTH fonts are resolved AND the Lottie animation has finished.

#### Scenario: Happy path — both ready

- GIVEN fonts loaded AND animation finished
- WHEN both conditions are true
- THEN `SplashScreen.hideAsync()` MUST be called
- AND the app SHALL render `<AuthProvider><Stack /></AuthProvider>`

#### Scenario: Fonts load before animation ends

- GIVEN fonts loaded in 200ms
- WHEN the Lottie animation is still playing
- THEN the app SHALL wait for `animationDone`

#### Scenario: Animation ends before fonts

- GIVEN the animation finished
- WHEN fonts are still loading
- THEN the app SHALL wait for fonts (loaded or error)

### Requirement: R5 — Font Timeout Safety

If fonts are not resolved within 10 seconds, the app MUST proceed with system font fallback.

#### Scenario: Font timeout forces transition

- GIVEN fonts have not loaded within 10 seconds
- WHEN the timeout fires
- THEN `fontsError` SHALL be set
- AND the app SHALL transition when animation finishes (or immediately if already done)

#### Scenario: Font error is non-blocking

- GIVEN font loading returns an error
- WHEN the error occurs
- THEN the app SHALL proceed with system font fallback
- AND no freeze SHALL occur

### Requirement: R6 — Pure Presentation Splash Component

`<SplashScreen />` MUST NOT call any `expo-splash-screen` API. It SHALL render the Lottie animation and fire `onAnimationFinish` when done.

#### Scenario: SplashScreen has no side effects

- GIVEN `<SplashScreen />` is instantiated
- WHEN it renders the Lottie animation
- THEN it MUST NOT call `preventAutoHideAsync()` or `hideAsync()`
- AND it MUST fire `onAnimationFinish` on completion

## Non-Goals

- Dark mode splash variant: not supported
- Static splash image: Lottie IS the brand
- Custom splash transitions: only the native `SplashScreen.setOptions()` fade
- Reanimated transitions on the splash: out of scope
- App icon changes: out of scope
