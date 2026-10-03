import { AppState } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Crypto from "expo-crypto";
import { createMMKV } from "react-native-mmkv";
import AppPrivacy from "@/modules/app-privacy";

const store = createMMKV({ id: "clipboard-clear" });
const STORE_KEY = "pending";

// Stop retrying a pending clear this long after it was due.
const RETRY_WINDOW_MS = 10 * 60 * 1000;
// While the app is not readable yet (just launched, or in the background),
// try again a few times.
const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 5;

interface IFingerprint {
  salt: string;
  hash: string;
}

// What is written to the device: the fingerprint and when the clear is due.
interface IStoredRecord extends IFingerprint {
  dueAt: number;
}

interface IPendingClear {
  id: number;
  dueAt: number;
  retries: number;
  // The password itself while the app that copied it is still running.
  text?: string;
  // A salted hash, after the app restarted. The password is never stored.
  fingerprint?: IFingerprint;
}

const isStoredRecord = (value: unknown): value is IStoredRecord =>
  typeof value === "object" &&
  value !== null &&
  "dueAt" in value &&
  "salt" in value &&
  "hash" in value &&
  typeof value.dueAt === "number" &&
  Number.isFinite(value.dueAt) &&
  typeof value.salt === "string" &&
  typeof value.hash === "string";

let pending: IPendingClear | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let lastId = 0;
let appStateSubscribed = false;

// True when copies are marked sensitive and can be cleared later (Android
// builds that include the native module).
export const canClearClipboard = AppPrivacy !== null;

export async function copySensitiveText(text: string): Promise<void> {
  if (AppPrivacy) {
    await AppPrivacy.copySensitive(text);
    return;
  }

  await Clipboard.setStringAsync(text);
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const hashWithSalt = (salt: string, text: string): Promise<string> =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + text);

function forget(target: IPendingClear): void {
  if (pending?.id !== target.id) {
    return;
  }

  pending = null;
  store.remove(STORE_KEY);

  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

function armTimer(delayMs: number): void {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    void clearIfDue();
  }, delayMs);
}

async function matches(
  target: IPendingClear,
  clipText: string,
): Promise<boolean> {
  if (target.text !== undefined) {
    return clipText === target.text;
  }

  if (target.fingerprint) {
    const hash = await hashWithSalt(target.fingerprint.salt, clipText);
    return hash === target.fingerprint.hash;
  }

  return false;
}

async function clearIfDue(): Promise<void> {
  const target = pending;
  if (!AppPrivacy || !target || Date.now() < target.dueAt) {
    return;
  }

  try {
    const clip = await AppPrivacy.readOwnClip();

    if (clip.status === "unavailable") {
      // Keep the clear pending; Android may not let a background app read the
      // clipboard. It is retried shortly and whenever the app is active again.
      const expired = Date.now() > target.dueAt + RETRY_WINDOW_MS;
      if (expired || target.retries >= MAX_RETRIES) {
        forget(target);
      } else {
        target.retries += 1;
        armTimer(RETRY_DELAY_MS);
      }
      return;
    }

    if (clip.status === "own" && (await matches(target, clip.text))) {
      await AppPrivacy.clearClipboard();
    }
  } catch {
    // Best effort: nothing more to do if the clipboard cannot be cleared.
  }

  forget(target);
}

function subscribeToAppState(): void {
  if (appStateSubscribed) {
    return;
  }

  appStateSubscribed = true;
  AppState.addEventListener("change", (state) => {
    if (state === "active" && pending) {
      pending.retries = 0;
      void clearIfDue();
    }
  });
}

async function storeFingerprint(target: IPendingClear, text: string) {
  const salt = toHex(Crypto.getRandomBytes(16));
  const hash = await hashWithSalt(salt, text);

  // Skip it if the clear already happened or a newer copy replaced this one.
  if (pending?.id === target.id) {
    const record: IStoredRecord = { dueAt: target.dueAt, salt, hash };
    store.set(STORE_KEY, JSON.stringify(record));
  }
}

// Clears the clipboard after `delayMs`, but only if it still holds `text`.
// Best effort: it needs the app to be running, and Android will not let a
// background app read the clipboard, so a clear that is due while the app is
// in the background happens when it returns to the foreground.
//
// With `saveFingerprint`, a salted hash of the text is also stored on the
// device so the clear can still happen the next time the app starts if it was
// killed first. Only use that for passwords too strong to guess back from a
// hash; the password itself is never stored.
export function scheduleClipboardClear(
  text: string,
  delayMs: number,
  saveFingerprint: boolean,
): void {
  if (!AppPrivacy) {
    return;
  }

  subscribeToAppState();

  const target: IPendingClear = {
    id: ++lastId,
    dueAt: Date.now() + delayMs,
    retries: 0,
    text,
  };

  pending = target;
  store.remove(STORE_KEY);
  armTimer(delayMs);

  if (saveFingerprint) {
    void storeFingerprint(target, text).catch(() => undefined);
  }
}

// Call once at app start: finishes a clear that was interrupted when the app
// was killed.
export function resumeClipboardClear(): void {
  const raw = store.getString(STORE_KEY);
  if (!AppPrivacy || pending || !raw) {
    return;
  }

  try {
    const saved: unknown = JSON.parse(raw);
    if (!isStoredRecord(saved)) {
      store.remove(STORE_KEY);
      return;
    }

    pending = {
      id: ++lastId,
      dueAt: saved.dueAt,
      retries: 0,
      fingerprint: { salt: saved.salt, hash: saved.hash },
    };
  } catch {
    store.remove(STORE_KEY);
    return;
  }

  subscribeToAppState();
  armTimer(Math.max(0, pending.dueAt - Date.now()));
}
