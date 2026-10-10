# Pass Dice

A random password generator for Android, built with Expo and React Native.

- Choose which characters to use (uppercase, lowercase, numbers, symbols) and a length from 8 to 64.
- Passwords are generated with the device's secure random generator.
- See how strong the password is, regenerate it, and copy it. The copied password is cleared from the clipboard after a minute on a best-effort basis.
- Light and dark themes (dark by default), saved between launches.
- An optional "Help Me" tab for one-time tips through Google Play.

Android is the supported platform. iOS and web are not supported.

## Requirements

| Tool | Version |
|---|---|
| Node.js | 20.19.4 or newer (22.13+ and 24.3+ also work; developed on 24) |
| pnpm | 12 (pinned in `package.json`; the lockfile is `pnpm-lock.yaml`) |
| JDK | 17 or newer (developed on 21) |
| Android Studio | With the Android SDK, platform tools and an emulator, or a physical Android device with USB debugging on |

Set `ANDROID_HOME` and add the SDK tools to your `PATH` (macOS example, in `~/.zshrc`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

If you do not have pnpm, install it with `npm install -g pnpm@12`.

## Getting started

```bash
git clone https://github.com/ahmersdev/pass-dice.git
cd pass-dice
pnpm install
```

Start an Android emulator (or plug in a device), then build and run the app:

```bash
pnpm android
```

The first run generates the native `android/` project, compiles it, installs the app and starts the dev server. It takes several minutes; later runs are much faster.

From then on, start only the dev server and open the app that is already installed:

```bash
pnpm start
```

### Why not Expo Go?

The app uses native code that Expo Go does not include (fast key-value storage for the saved theme, Google Play billing, and the local `app-privacy` module). It needs a development build, which `pnpm android` creates. JavaScript changes reload instantly; any change to native code (anything in `modules/`, or adding a package with native code) needs `pnpm android` again.

## Scripts

| Command | What it does |
|---|---|
| `pnpm start` | Start the Expo dev server |
| `pnpm android` | Build and run a development build on an Android emulator or device |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the unit tests (Jest) |
| `npx tsc --noEmit` | Type check |
| `npx expo-doctor` | Check the project's dependencies and config |

Run the type check, lint and tests before opening a pull request.

When adding a dependency, use `npx expo install <package>` so the version matches the Expo SDK.

## Project structure

```
src/
  app/          Routes (Expo Router)
  features/     One folder per screen
  components/   Reusable UI components
  layouts/      Shared page layout
  utils/        Secure random numbers and the clipboard helper
  theme/        Light and dark themes, fonts
modules/
  app-privacy/  Local Android module: sensitive clipboard and a blank app-switcher preview
docs/
  structure.md  Folder and file patterns, and how to add things
```

Read [docs/structure.md](docs/structure.md) before adding a screen, component or icon. It explains the conventions the code follows.

## Notes

- **Help Me tips:** Purchases need the app and three one-time products (`tip_coffee`, `tip_lunch`, `tip_feature`) set up in Google Play Console for the package `com.ahmersdev.passdice`, and a build installed from a Play test track. Without them the tip cards stay disabled, which is expected on a local build.
- **Environment variables and secrets:** None are needed to run the app. Signing keys and Play Console credentials are not stored in this repository.
- **Package name:** `com.ahmersdev.passdice`. If you fork the app, change `android.package` in `app.json` before building.

## Troubleshooting

- **The app does not see my changes, or Metro behaves oddly:** restart the dev server with a clean cache: `npx expo start --clear`.
- **Native errors after pulling changes or switching branches:** rebuild the native project from scratch: `npx expo prebuild --platform android --clean`, then `pnpm android`.
- **`SDK location not found` or `adb` not found:** `ANDROID_HOME` is not set, or the Android SDK is not installed. See Requirements.
- **Copying works but the clipboard is not cleared, or the app switcher preview is not blank:** the installed app is an older development build without the `app-privacy` module. Rebuild with `pnpm android`.
- **A Gradle or Java version error:** make sure `JAVA_HOME` points to JDK 17 or newer.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Unistyles](https://www.unistyl.es/)
