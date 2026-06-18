## Exploration: Splash Screen Fix & Custom Lottie Animation

### Change Name
`splash-screen-lottie`

### Current State

#### app.json — No native splash config
`app.json` has NO `expo.splash` section and NO `expo-splash-screen` config plugin. The `expo-splash-screen` package IS installed (`~31.0.13` for Expo SDK 54), but with zero configuration. This means:

- **No native splash screen** is shown on launch — just a default white/blank screen
- `SplashScreen.preventAutoHideAsync()` in `SplashScreen.tsx` module scope fires but has NOTHING to prevent (likely throws or is silently ignored)
- `SplashScreen.hide()` also does nothing meaningful

#### SplashScreen.tsx — Module-scope call in wrong file
```tsx
ExpoSplashScreen.preventAutoHideAsync()  // module scope, fires on import
```
- This call is at module scope of `src/components/SplashScreen.tsx`
- It only fires when that module is **imported**, not when the app starts
- Since `_layout.tsx` conditionally imports it (only renders after fonts load), the call may be delayed
- Uses `hide()` (synchronous, deprecated) instead of `hideAsync()` (async, recommended)

#### _layout.tsx — Font loading blocks everything (THE MAIN BUG)
```tsx
const [loaded] = useFonts({ Monserrat: require("...") })

if (!loaded) {
  return null  // ← BLANK SCREEN while fonts load
}

if (!isAppReady) {
  return <SplashScreen onReady={handleSplashFinish} />  // ← Lottie only starts after fonts
}
```
This is the critical issue. The timeline is:

```
App launch → default white screen (no native splash)
  → JS bundle loads → _layout runs
    → useFonts starts → returns null (WHITE SCREEN for ~200-800ms on device)
      → fonts load → renders SplashScreen with Lottie (animation starts HERE)
        → 4 seconds of Lottie
          → animation finishes → renders real app
```

**Total delay before Lottie**: font loading time (~200-800ms) + Lottie duration (4s) = ~4.2-4.8s
**Wasted time**: fonts load in series before Lottie, instead of in parallel

#### Lottie Asset
- ✅ Valid Lottie JSON (v5.9.6, 60fps, 240 frames = 4s duration, 1400x500, 21 layers, ~34KB)
- ✅ `lottie-react-native` v7.3.8 installed
- ✅ `react-native-reanimated` v4.1.7 available for transitions

#### Verified Problem Summary
| Issue | Severity | Detail |
|-------|----------|--------|
| No native splash config | High | White flash on launch, `preventAutoHideAsync()` is no-op |
| Fonts block Lottie | High | Lottie doesn't start until fonts finish — wrong order |
| No font error handling | Medium | If font fails, `loaded` stays `false` → app never renders |
| `hide()` instead of `hideAsync()` | Low | Still works but deprecated |
| No splash timeout fallback | Medium | If Lottie never fires `onAnimationFinish`, app is stuck |

### Approaches

#### Option A: Minimal native splash + Lottie in parallel with fonts (RECOMMENDED)

**Strategy**: Configure the native splash as a brief "loading cover" with just a backgroundColor. Hide it immediately when React mounts, then show the Lottie animation while loading fonts in parallel.

**Timeline**:
```
App launch → native splash (solid #fff, ~100ms)
  → JS loads → React renders Lottie behind native splash
    → useEffect hides native splash → Lottie becomes visible
      → Lottie plays (4s) ← FONTS LOAD IN PARALLEL ←
        → Both Lottie done AND fonts loaded → render <Stack />
```

**Changes required**:
1. **`app.json`**: Add `expo-splash-screen` config plugin with `backgroundColor: "#ffffff"` (no image — pure color, avoids stale icon)
2. **`_layout.tsx`**: 
   - Move `preventAutoHideAsync()` here (app entry point)
   - Remove the `if (!loaded) return null` guard
   - Render `<SplashScreen />` IMMEDIATELY
   - Hide native splash on mount (via useEffect)
   - Track both `fontsLoaded` AND `animationFinished`
   - Show app when both are ready
3. **`SplashScreen.tsx`**:
   - Remove module-scope `preventAutoHideAsync()` (moved to _layout)
   - Rename `onReady` → `onFinish` (clearer semantics)
   - Remove `ExpoSplashScreen.hide()` call (handled by _layout)
   - Optionally accept a `visible` prop for future Reanimated transitions
4. **Font error handling**: Use `[loaded, error]` return from `useFonts`, treat error as "fonts ready" (falls back to system font)
5. **Splash timeout**: Add `useEffect` with 10s timeout as safety net

**Pros**:
- ✅ **Zero white flash** — native splash (solid color) visible instantly
- ✅ **Lottie visible immediately** — fonts load in background
- ✅ **Parallel loading** — saves ~200-800ms of perceived loading time
- ✅ **Native feel** — no flicker between states
- ✅ **Handles font errors** — app renders even if font fails
- ✅ **Timeout safety** — can't get stuck forever

**Cons**:
- ⚠️ Requires native rebuild (config plugin modifies native project on prebuild)
- ⚠️ Slightly more complex state (two readiness flags instead of one)

**Effort**: Low — ~4 files, ~30 lines changed total

---

#### Option B: No native splash at all (current approach, fixed)

**Strategy**: Remove all native splash references. Show Lottie immediately on React mount, load fonts in parallel. Transition when both ready.

**Changes**:
- Remove `expo-splash-screen` from `_layout.tsx` entirely (or keep it but without config)
- Same parallel loading fix as Option A
- No `app.json` changes

**Pros**:
- ✅ Simple — no native config needed
- ✅ Parallel font loading (same as Option A)
- ✅ No native rebuild needed

**Cons**:
- ❌ **White flash on launch** — between native load and React mount, user sees a white screen. On slower devices this is 200-500ms of blank
- ❌ No native splash means nothing covers that initial period
- ❌ `expo-splash-screen` package becomes dead weight

**Effort**: Low — ~3 files, ~20 lines changed

**Verdict**: Inferior to Option A. The white flash is a known UX anti-pattern.

---

#### Option C: Full native splash + branded image + fade to Lottie

**Strategy**: Configure a full native splash with a branded image/icon in `app.json`. Show that natively, then fade-transition to the Lottie as a React component, load fonts in background, then fade to the real app.

**Changes**:
- `app.json`: full splash config with `image`, `backgroundColor`, `resizeMode`, `dark` variants
- `_layout.tsx`: three-phase state (native splash visible → Lottie visible → app visible)
- Use `SplashScreen.setOptions({ fade: true, duration: 500 })` for smooth native → React transition
- Use Reanimated for Lottie → app fade transition

**Pros**:
- ✅ **Most polished** — branded image from the very first frame
- ✅ Smooth fade transitions between phases
- ✅ Dark mode support via `dark` config

**Cons**:
- ❌ **Over-engineered for this use case** — three visual phases is complex
- ❌ Need a branded splash image (don't have one, would need creation)
- ❌ Must ensure Lottie's first frame matches the splash image (or the transition looks bad)
- ❌ More code, more edge cases, more testing
- ❌ Native splash image and Lottie become dual sources of truth for branding

**Effort**: Medium-High — requires design asset, multiple files, Reanimated transitions

**Verdict**: Overkill. The Lottie IS the splash brand — adding a static image before it adds complexity without proportional value.

---

### Recommendation

**Option A** is the clear winner. Here's why:

1. **Minimal aesthetic gap**: The user only sees the native splash backgroundColor for ~100-300ms (native load + JS parse), then the Lottie takes over. This is the fastest path to the branded experience.
2. **Parallel loading**: Fonts load DURING the Lottie animation, not before it. This saves the user from staring at a blank screen while fonts download.
3. **Resilient**: Font loading errors don't break the app. The Lottie animation has a timeout fallback.
4. **Clean architecture**: `_layout.tsx` owns the orchestration; `SplashScreen.tsx` is a pure presentation component.
5. **Builds on existing code**: Refactors, doesn't rewrite. The SplashScreen component is largely correct — just needs the module-scope call moved and `hide()` removed.

### Key Files to Modify

| File | Change |
|------|--------|
| `app.json` | Add `[ "expo-splash-screen", { "backgroundColor": "#ffffff" } ]` to plugins array |
| `app/_layout.tsx` | Add `preventAutoHideAsync()` module scope; remove `if (!loaded) return null`; add dual-state tracking (fonts + animation); hide native splash on mount; add font error handling; add timeout safety |
| `src/components/SplashScreen.tsx` | Remove module-scope `preventAutoHideAsync()`; remove `hide()` call; remove `expo-splash-screen` import; rename `onReady` → `onFinish` for clarity |
| `app.json` (icon) | Optionally replace default icon with `./assets/images/logo.png` for the app icon (separate from splash) |

### Edge Cases

| Edge Case | Risk | Mitigation |
|-----------|------|------------|
| **Font loading fails** | Medium | Use `[loaded, error]` from `useFonts`. If error, treat as "fonts ready" → app renders with system font |
| **Lottie animation error** | Medium | Add `useEffect` with 10s timeout that forces `animationFinished = true`. Lottie exceptions won't freeze the app |
| **App suspends during Lottie** | Low | Lottie pauses on suspend, resumes on foreground. `onAnimationFinish` fires when animation completes |
| **Deep link during splash** | Low | Expo Router queues deep links. App processes them after splash → redirect works normally |
| **Dark mode** | Low | Native splash has `#ffffff` bg (light). Add `dark: { backgroundColor: "#000000" }` if needed. Lottie colors are baked into JSON |
| **Native rebuild** | Low | Config plugin requires `npx expo prebuild` (or first native build). Won't affect dev with Expo Go if using dev builds |
| **Rapid mount/unmount** | Low | `hasFinished` ref in SplashScreen already prevents double-fire of `onAnimationFinish` |

### Risks

1. **Native build required**: The `expo-splash-screen` config plugin modifies native projects. This only takes effect after `npx expo prebuild` or a native build. In Expo Go (managed workflow), this should work transparently on rebuild.
2. **`preventAutoHideAsync()` timing**: Must be called BEFORE any component renders. At module scope in `_layout.tsx` is safe, but if the import order somehow changes, it might fail. Wrap in try/catch.
3. **Version compatibility**: `expo-splash-screen` ~31.0.13 is the correct version for Expo SDK 54. The `hide()` vs `hideAsync()` distinction is minor but worth fixing.
4. **Lottie frame mismatch**: The Lottie is 1400x500 (landscape-ish), but mobile screens are portrait. The `resizeMode="cover"` will crop it. Verify visual result on real devices.

### Ready for Proposal

**Yes**. The problem is fully scoped, all approaches are compared, and Option A has clear reasoning. Proceed to `sdd-propose`.

**What the orchestrator should tell the user**: "The splash has three concrete bugs: (1) no native splash config in app.json, (2) font loading blocks the Lottie from showing, (3) no font error handling can permanently freeze the app. I recommend a minimal native splash config with background color only, parallel loading of fonts and Lottie animation, and a 10-second safety timeout. This eliminates the white flash and reduces perceived load time by hiding font loading latency inside the animation duration."
