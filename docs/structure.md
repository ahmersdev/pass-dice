# Pass Dice: project structure and patterns

This document explains how the project is laid out, what each folder and file is for, and the patterns to follow when adding code. Read it before adding a screen, component or icon.

## Overview

Pass Dice is an Expo (SDK 57) React Native app, built for Android first. iOS config is kept so a later iOS release needs minimal work; web is not supported.

| Concern | Choice |
|---|---|
| Navigation | Expo Router (file-based), bottom tabs with a custom tab bar |
| Styling and theming | `react-native-unistyles` (light and dark themes) |
| Persisted settings | `react-native-mmkv` (stores the chosen theme) |
| Icons | `lucide-react-native`, plus two local brand logos |
| Fonts | Bebas Neue (headings), DM Sans (body), DM Mono (password and character labels), via `@expo-google-fonts` |
| In-app purchases | `expo-iap` (one-time tips on the Help Me tab) |
| Toasts | `react-native-toast-message` |
| Randomness and clipboard | `expo-crypto` (secure random numbers), `expo-clipboard` |
| Gestures | `react-native-gesture-handler` (the Length slider) |
| Animation | `react-native-reanimated` |
| Tests | Jest with the `jest-expo` preset and `@testing-library/react-native` |

Native modules (MMKV, Unistyles, `expo-iap`) mean the app needs a development build. It does not run in Expo Go: `npx expo run:android`.

## Top-level layout

```
pass-dice/
├── app.json              Expo config (name, package, plugins)
├── babel.config.js       Babel preset plus the Unistyles plugin (root: "src")
├── tsconfig.json         TypeScript config and the "@/..." path aliases
├── eslint.config.js      Lint config (`npx expo lint`)
├── assets/               Static files referenced by app.json (app icon, splash, adaptive icon, icon-source.svg master)
├── docs/                 Project documentation (this folder)
├── modules/              Local native modules (Android privacy helper)
├── .claude/, .vscode/    Editor and Claude Code settings (not app code)
└── src/                  All application code
```

`ios/`, `android/` and `.expo/` are generated and git-ignored. Never edit them by hand; native settings go in `app.json` or config plugins.

## `src/` layout

```
src/
├── app/            Routes only (Expo Router). Thin files.
├── features/       One folder per screen: the screen's UI, logic, data
├── layouts/        RootLayout (app shell) and TabsLayout (shared tab page layout)
├── components/     Reusable UI components, plus a barrel (index.ts)
├── assets/icon/    Our own SVG icon components (GitHub, LinkedIn)
├── constants/      Route names, page titles, layout numbers
├── utils/          Small helpers shared across features (secure random numbers)
└── theme/          Unistyles setup: themes, fonts, saved-theme loading
```

### `app/` (routes)

Every file here is a route. Keep them thin: a route file only renders the matching feature.

```
app/
├── _layout.tsx          Theme import, then renders layouts/root (RootLayout)
└── (tabs)/
    ├── _layout.tsx      Tabs navigator using the custom tab bar
    ├── index.tsx        Generator tab   -> features/generator
    ├── help-me.tsx      Help Me tab     -> features/help-me
    └── settings.tsx     Settings tab    -> features/settings
```

### `features/` (screens)

A feature folder holds everything for one screen:

| File | Purpose |
|---|---|
| `index.tsx` | The screen component (markup only) |
| `use-<feature>.ts` | The screen's logic and state, as a hook |
| `<feature>.interface.ts` | Types for the hook and screen |
| `<feature>.data.ts` | Static data (lists, labels, product IDs) |
| `<feature>.utils.ts` | Pure helper functions |
| `<feature>.styles.ts` | Unistyles styles |

Create only the files a feature needs. Examples:
- `settings/`: `index.tsx`, `use-settings.ts` (theme toggle and saving), `settings.data.ts` (contact links), `settings.styles.ts`.
- `help-me/`: `index.tsx`, `use-help-me.ts` (store connection, purchases and the success and error toasts), `help-me.data.ts` (tip tiers), `help-me.interface.ts`, `help-me.utils.ts`. It has no styles file because it borrows `actionCardStyles` from the barrel.
- `generator/`: the password generator. `use-generator.ts` holds the state (length, selected character types, password) and the copy action, `generator.utils.ts` has `generatePassword` and `getPasswordStrength`, `generator.data.ts` has the character sets, length limits (8 to 64, default 16) and strength thresholds.

### `components/` (reusable UI)

Each component gets its own folder, named in kebab-case, with the same anatomy:

```
components/card/
├── index.tsx            The component (default export)
├── card.interface.ts    Props types
└── card.styles.ts       Styles (exported as cardStyles)
```

Add `use-<name>.ts` when the component has logic (state, animation, handlers) and `<name>.utils.ts` or `<name>.data.ts` for helpers and static data. Current examples:
- `custom-switch/`: animation and toggle logic live in `use-custom-switch.ts`.
- `custom-tab-bar/`: `use-custom-tab-bar.ts` (pill animation, press handling) and `custom-tab-bar.utils.ts` (the tab list: icon and label per route).
- `tab-item/`: a single tab, with its own hook for the label animation.
- `app-icon/`: renders any Lucide-style icon at a given size, color and stroke width.
- `action-card/`, `card/`, `screen-title/`, `short-heading/`: small building blocks.
- `section-card/`, `password-text/`, `strength-meter/`, `button/`, `icon-button/`, `checkbox-row/`, `slider/`: the pieces of the Generator screen. `slider/` is a custom draggable slider built on gesture handler; its drag logic is in `use-slider.ts`.
- Components never import from `features/`. Shared types and helpers a component needs live in that component's folder (for example `password-text.utils.ts`).

`components/index.ts` is the barrel. Every component is exported from it.

### `layouts/`

Each layout is a folder with the same anatomy as a component (`index.tsx`, `<name>.styles.ts`, `<name>.interface.ts`, `use-<name>.ts` when needed) and is exported from `layouts/index.ts`.

- `root/` (`RootLayout`): the app shell rendered by `app/_layout.tsx`. It loads fonts, keeps the splash screen up until they are ready, finishes any interrupted clipboard clear, and renders the gesture root, safe area provider, status bar, stack and toast host. Its logic is in `use-root-layout.ts`. It lives here, not in `app/`, because route folders may only hold routes.
- `tabs/` (`TabsLayout`): safe area, the page title (`ScreenTitle`), a scrolling body, and padding so content clears the floating tab bar. Every tab screen renders inside it and passes its title as `titleProps`.

### `assets/icon/` (our own icons)

Lucide 1.x no longer includes brand logos, so `github.tsx` and `linkedin.tsx` are small outlined SVG components built with `react-native-svg`. They are exported from `index.ts` and take `size`, `color` and `strokeWidth` like Lucide icons. Add any other custom icon here.

### `utils/`

Small, framework-light helpers used by more than one place.

- `secure-random.ts` exports `secureRandomInt(max)`, an unbiased random integer from the device's secure random generator (`expo-crypto`). If the generator fails it throws `SecureRandomError`; callers show an error and never fall back to a weaker source. Use it for anything security-sensitive; never `Math.random`.
- `sensitive-clipboard.ts` copies text to the clipboard (marked sensitive on Android) and clears it later, but only if it still holds that text. `resumeClipboardClear()` runs once at app start (in `app/_layout.tsx`) to finish a clear that was interrupted when the app was killed. See "Local native modules" below.

### Types defined outside `.interface.ts` files (intentional)

Two files keep their types inline on purpose, because each stands alone and has no feature or component folder to hold an interface file:

- `utils/sensitive-clipboard.ts` keeps its private record types (`IFingerprint`, `IStoredRecord`, `IPendingClear`) next to the code that uses them. They are not exported.
- `modules/app-privacy/index.ts` keeps `IClipRead` and `IAppPrivacyModule` beside the native module binding they describe.

`theme/unistyles.ts` also declares `UnistylesThemes`, which Unistyles requires to be an interface in that file.

### Hard-coded colours (intentional)

Theme colours come from the theme everywhere except two places: the switch thumb in `custom-switch.styles.ts` (always `#FDFDFD`, on both themes) and the default `color` of the GitHub and LinkedIn icons (`#000000`, a fallback prop value).

### `modules/` (local native modules)

`modules/app-privacy/` is a small Android-only Expo module (Kotlin) with three jobs. Import it with `@/modules/app-privacy`; it is `null` on builds that do not include it (an older development build, or iOS), and the app then falls back to a plain `expo-clipboard` copy with no clearing.

- `copySensitive(text)` puts text on the clipboard marked as sensitive (Android 13+ hides it from the clipboard preview) and labels the clip as this app's own.
- `readOwnClip()` and `clearClipboard()` support clearing. `readOwnClip()` reports `"own"` (with the text), `"other"` or `"unavailable"`, and never reads another app's clipboard content, so it does not trigger Android's "pasted from your clipboard" notice. `"unavailable"` also covers Android 10+ not letting a background app read the clipboard.
- While the app is in the background it sets the window secure flag, so the recent-apps preview is blank. Screenshots and recordings still work while the app is on screen. It applies to the whole app, not one screen.

Native code only changes with a new development build (`npx expo run:android`).

### Android manifest hardening

`app.json` sets `android.allowBackup` to `false` so Google Drive auto-backup never copies the app's storage (the clipboard-clear record and the saved theme). It also lists `blockedPermissions` for `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW` and `VIBRATE`, which the Expo template adds but this app never uses. Only `INTERNET` and the Play Billing permissions remain. These take effect on the next native build (`npx expo run:android` or an EAS build).

### App icon

The icon is a red die on near-black with a keyhole as the centre pip. `assets/icon-source.svg` is the vector master (100-unit grid, die 64 wide). The files in `assets/images/` and `assets/expo.icon/` are all rendered from it with the same proportions:

- `icon.png`: 1024 px, opaque, die at 64% of the width.
- `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`: 1024 px adaptive layers. The die is 49% of the width so it stays inside the circular safe zone. The background is solid `#0D0C0C`; the monochrome layer is a white die with the pips and keyhole cut out.
- `splash-icon.png`: transparent, die at 80% of the width, shown on the `#0D0C0C` splash colour at `imageWidth` 160.
- `expo.icon/`: the iOS Icon Composer bundle, with `Assets/die.png` over a dark solid fill.

Icon changes need a new native build to show up.

### `constants/`

- `routes.ts`: `ROUTE_NAMES` (route file names) and `PAGE_TITLES` (the heading and tab label for each page).
- `layout.ts`: tab bar height and margin, and `getTabBarBottomInset`.

### `theme/unistyles.ts`

Defines the light and dark themes (colors, typography, a `gap` spacing helper), reads the saved theme from MMKV, and calls `StyleSheet.configure`. It also exports `mmkvStorage` and `THEME_STORAGE_KEY`.

## Patterns and rules

### Exports and imports

- Every component, screen, layout and hook uses `export default function Name() {}`.
- Styles and interfaces use named exports (`cardStyles`, `ICardProps`).
- Outside `components/`, import components from the barrel: `import { ActionCard } from "@/components"`.
- Inside `components/`, import sibling components by relative path (`../card`). Going through the barrel from inside it creates circular imports.
- Type-only imports of a component's interface may use the full path (`@/components/app-icon/app-icon.interface`).
- Path aliases: `@/...` maps to `src/...`. `@/assets/...` looks in `src/assets` first, then the root `assets/`.

### Keep files single-purpose

- A component file has markup only. Logic goes in the `use-` hook, styles in `.styles.ts`, types in `.interface.ts`.
- No inline style objects in components. Put them in the styles file, using a function style for dynamic values (`styles.track(value)`).
- Interfaces use an `I` prefix (`ICardProps`).

### Theming

- Styles use `StyleSheet.create((theme) => ({ ... }))` from `react-native-unistyles`. Read colors, spacing (`theme.gap(2)` is 16) and fonts from the theme; never hard-code colors.
- Fonts: `theme.typography.heading.regular` (Bebas Neue) for headings, `theme.typography.body.regular | medium | bold` (DM Sans) for everything else, and `theme.typography.mono.regular | medium` (DM Mono) for the password and the character labels. Bebas Neue is all-caps, so never use it for text where upper and lower case must differ.
- Theme colors beyond the basics: `onPrimary` (text and icons on the primary color), `digit` and `symbol` (password character tints), and `strengthWeak | strengthFair | strengthStrong | strengthVeryStrong` (the strength meter). Add new colors to both themes.
- To read the theme in a component body (for example to pass a color to an icon), use `useUnistyles()`.
- The theme must be configured before any `StyleSheet.create` runs. Expo Router loads layout files in its own order, so both `app/_layout.tsx` and `app/(tabs)/_layout.tsx` start with `import "@/theme/unistyles";`. Keep it as the first import in any new layout file.
- The app starts in dark mode. The Settings switch saves the choice in MMKV under the key `app_theme`, and it is restored at launch.

### Icons

- Use Lucide icons through `AppIcon`: pass the icon component, a size, a color and optionally a stroke width (default 2).
- Import each icon by its own path, not from the package root: `import House from "lucide-react-native/icons/house"`. Importing from the root pulls every icon into the bundle (about 2 MB extra).
- Icons are passed around as components (`icon: House`), not strings.
- The active tab is shown by color only; icons are outlined and not filled.

### Routes and tabs

- Page names live in `constants/routes.ts`. To add a tab: add the names to `ROUTE_NAMES` and `PAGE_TITLES`, create the route file in `app/(tabs)/`, add a `Tabs.Screen` in `app/(tabs)/_layout.tsx`, and add the icon and label to `TAB_CONFIG` in `components/custom-tab-bar/custom-tab-bar.utils.ts`.

### Generator (password generator)

- Three cards: Your password (with strength meter, Copy and a regenerate button), Length (minus, slider, plus) and Characters (four checkbox rows).
- A new password is generated on every change (length, a checkbox, or the regenerate button) inside the handlers in `use-generator.ts`, not in an effect.
- At least one character type always stays selected, and every selected type appears at least once in the password.
- Randomness comes only from `secureRandomInt` for the password. Every character is drawn uniformly from the combined pool and the draw is repeated until every selected type is present, so all valid passwords are equally likely. `generatePassword` throws a `RangeError` if the length is shorter than the number of selected types.
- Strength is `length * log2(pool size)` adjusted for the strings that miss a selected type (`getValidFraction`), mapped to Weak, Fair, Strong and Very strong.
- If the secure random generator fails, the Your password card shows an error with the regenerate button, and Copy is disabled.
- Tapping the regenerate button plays a scramble animation: every character shows a random look-alike (dimmed) and locks into the real password one at a time from left to right, about 45 ms apart and no more than about 0.8 s in total. It is skipped when the phone has reduce motion on, and length or checkbox changes update instantly. The logic is in `password-text/use-password-text.ts`. The scramble characters come from `Math.random` in `password-text.utils.ts` on purpose: they are decoration, independent of the password, so a secure source would add a failure mode and no safety. The real password only ever comes from `secureRandomInt`.
- Copy goes through `copySensitiveText` (sensitive flag on Android builds with the native module, plain `expo-clipboard` otherwise), shows a "Copied" toast and announces it to screen readers. On Android it schedules a clear after 60 seconds, only if the clipboard still holds the password, and the toast says "We'll try to clear it from the clipboard in 1 minute". The clear is best effort: the app must be running, and one that comes due in the background runs when the app returns to the foreground.
- If the app is killed before the clear, passwords rated Very strong (at least 80 bits) also store a salted SHA-256 fingerprint in MMKV (never the password), and the next app start clears the clipboard if it still holds that password. Weaker passwords store nothing, because a hash of a short or weak password could be guessed back; they are cleared only while the app stays alive.
- The root layout wraps the app in `GestureHandlerRootView`, which the slider needs.

### Help Me (in-app tips)

- Three one-time products with the IDs `tip_coffee`, `tip_lunch` and `tip_feature` (see `help-me.data.ts`). They must exist in Google Play Console for the package `com.ahmersdev.passdice`.
- The screen is Android-only. The hook loads the products, shows each store price, starts the purchase, finishes it as a consumable, and shows a success or error toast. A cancelled purchase is ignored.
- Real purchases can only be tested from a Play Store test track.

## Tests

- Run them with `npx jest` (or `pnpm test`). Config is the `jest` block in `package.json`; it maps `@/...` the same way `tsconfig.json` does.
- Tests sit next to the code they cover, named `<file>.test.ts`. Never put a test file inside `src/app/`, because every file there is a route.
- What is covered: the secure random helper, the generator and strength logic, the Generator screen hook (error state, last-checkbox rule, copy flow), the scramble animation hook and the clipboard clear (including the restart case).
- Hooks are tested with `renderHook`; native and storage modules are mocked in the test file. For timing, use `jest.useFakeTimers()` and `jest.advanceTimersByTimeAsync`.
- Security-sensitive code should keep tests that fail if the safeguard is removed (rejection sampling, no weaker fallback, the length guard, "never store the password").

## How to add things

**A new screen**
1. Create `features/<name>/` with `index.tsx` and, if needed, a hook, interface, data and styles file.
2. Render it inside `TabsLayout` with a title.
3. Add the route file in `app/` (or `app/(tabs)/`) that renders the feature, and register it as above if it is a tab.

**A new component**
1. Create `components/<name>/` with `index.tsx`, `<name>.interface.ts`, `<name>.styles.ts` (and a hook, utils or data file if needed).
2. Export it from `components/index.ts`.

**A new icon**
1. A Lucide icon: import it by its own path.
2. Anything else: add a component to `src/assets/icon/` and export it from its `index.ts`.

## Commands

```bash
npx expo start            # start the dev server
npx expo run:android      # build and run a development build on Android
npx tsc --noEmit          # type check
npx jest                  # tests
npx expo lint             # lint
npx expo-doctor           # check dependencies and config
npx expo install <pkg>    # add a package (always use this, not npm/pnpm add)
```

Run the type check, lint and tests before finishing any change.
