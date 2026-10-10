import { AppState } from "react-native";
import type { IClipRead } from "@/modules/app-privacy";

// State shared with the mocks below. It lives outside the module registry, so
// it survives a simulated app restart just like the device's storage does.
const mockDisk = new Map<string, string>();
const mockPrivacy = {
  clip: { status: "other" } as IClipRead,
  clearCalls: 0,
  api: null as null | {
    copySensitive: (text: string) => Promise<void>;
    readOwnClip: () => Promise<IClipRead>;
    clearClipboard: () => Promise<void>;
  },
};
const mockAppStateListeners: ((state: string) => void)[] = [];
const mockPlainCopies: string[] = [];

jest.mock("expo-clipboard", () => ({
  setStringAsync: async (text: string) => {
    mockPlainCopies.push(text);
  },
}));
jest.mock("expo-crypto", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require("crypto");
  return {
    CryptoDigestAlgorithm: { SHA256: "SHA-256" },
    digestStringAsync: async (_algorithm: string, data: string) =>
      nodeCrypto.createHash("sha256").update(data).digest("hex"),
    getRandomBytes: (count: number) =>
      new Uint8Array(nodeCrypto.randomBytes(count)),
  };
});
jest.mock("react-native-mmkv", () => ({
  createMMKV: () => ({
    getString: (key: string) => mockDisk.get(key),
    set: (key: string, value: string) => mockDisk.set(key, value),
    remove: (key: string) => mockDisk.delete(key),
  }),
}));
jest.mock("@/modules/app-privacy", () => ({
  __esModule: true,
  get default() {
    return mockPrivacy.api;
  },
}));

type IClipboardModule = typeof import("./sensitive-clipboard");

const PASSWORD = "k7Q#mV2&xR9d$Tw4aaBB";
const DELAY_MS = 1000;

const createWorkingPrivacy = () => ({
  copySensitive: async (text: string) => {
    mockPrivacy.clip = { status: "own", text };
  },
  readOwnClip: async () => mockPrivacy.clip,
  clearClipboard: async () => {
    mockPrivacy.clearCalls += 1;
    mockPrivacy.clip = { status: "unavailable" };
  },
});

// A new app process: a fresh copy of the module, with storage left as it was.
const startApp = (): IClipboardModule => {
  mockAppStateListeners.length = 0;
  let loaded!: IClipboardModule;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    loaded = require("./sensitive-clipboard");
  });
  return loaded;
};

const advance = (ms: number) => jest.advanceTimersByTimeAsync(ms);

describe("sensitive clipboard", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_event, listener) => {
        mockAppStateListeners.push(listener as (state: string) => void);
        return { remove: jest.fn() };
      });
    mockDisk.clear();
    mockPlainCopies.length = 0;
    mockAppStateListeners.length = 0;
    mockPrivacy.clip = { status: "other" };
    mockPrivacy.clearCalls = 0;
    mockPrivacy.api = createWorkingPrivacy();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("clears the clipboard after the delay when it still holds the password", async () => {
    const app = startApp();

    await app.copySensitiveText(PASSWORD);
    app.scheduleClipboardClear(PASSWORD, DELAY_MS, false);
    expect(mockPrivacy.clearCalls).toBe(0);

    await advance(DELAY_MS + 50);

    expect(mockPrivacy.clearCalls).toBe(1);
  });

  it("stores nothing on the device when no fingerprint is requested", async () => {
    const app = startApp();
    await app.copySensitiveText(PASSWORD);
    app.scheduleClipboardClear(PASSWORD, DELAY_MS, false);
    await advance(10);

    expect(mockDisk.size).toBe(0);
  });

  it("leaves a clip that belongs to another app alone", async () => {
    const app = startApp();
    mockPrivacy.clip = { status: "other" };

    app.scheduleClipboardClear(PASSWORD, DELAY_MS, false);
    await advance(DELAY_MS + 50);

    expect(mockPrivacy.clearCalls).toBe(0);
  });

  it("does not clear a different password that was copied later", async () => {
    const app = startApp();
    mockPrivacy.clip = { status: "own", text: "a-newer-password" };

    app.scheduleClipboardClear(PASSWORD, DELAY_MS, false);
    await advance(DELAY_MS + 50);

    expect(mockPrivacy.clearCalls).toBe(0);
  });

  it("keeps waiting while the clipboard is unreadable and clears when the app returns", async () => {
    const app = startApp();
    const readable = mockPrivacy.api!.readOwnClip;
    mockPrivacy.api!.readOwnClip = async () => ({ status: "unavailable" });

    app.scheduleClipboardClear(PASSWORD, DELAY_MS, false);
    await advance(DELAY_MS + 100);
    expect(mockPrivacy.clearCalls).toBe(0);

    // Back in the foreground the clipboard can be read again.
    mockPrivacy.clip = { status: "own", text: PASSWORD };
    mockPrivacy.api!.readOwnClip = readable;
    mockAppStateListeners.forEach((listener) => listener("active"));
    await advance(10);

    expect(mockPrivacy.clearCalls).toBe(1);
  });

  it("stops retrying after a bounded number of attempts", async () => {
    const app = startApp();
    const readOwnClip = jest.fn(
      async (): Promise<IClipRead> => ({ status: "unavailable" }),
    );
    mockPrivacy.api!.readOwnClip = readOwnClip;

    app.scheduleClipboardClear(PASSWORD, DELAY_MS, false);
    await advance(DELAY_MS + 60000);

    // One attempt when it comes due plus five retries.
    expect(readOwnClip).toHaveBeenCalledTimes(6);
    await advance(60000);
    expect(readOwnClip).toHaveBeenCalledTimes(6);
  });

  it("still clears when the app returns after the timer retries ran out", async () => {
    const app = startApp();
    const readable = mockPrivacy.api!.readOwnClip;
    mockPrivacy.api!.readOwnClip = async () => ({ status: "unavailable" });

    app.scheduleClipboardClear(PASSWORD, DELAY_MS, false);
    await advance(DELAY_MS + 60000);
    expect(mockPrivacy.clearCalls).toBe(0);

    mockPrivacy.clip = { status: "own", text: PASSWORD };
    mockPrivacy.api!.readOwnClip = readable;
    mockAppStateListeners.forEach((listener) => listener("active"));
    await advance(10);

    expect(mockPrivacy.clearCalls).toBe(1);
  });

  it("gives up on a clear that stayed unreadable past the retry window", async () => {
    const app = startApp();
    const readOwnClip = jest.fn(
      async (): Promise<IClipRead> => ({ status: "unavailable" }),
    );
    mockPrivacy.api!.readOwnClip = readOwnClip;

    app.scheduleClipboardClear(PASSWORD, DELAY_MS, false);
    await advance(DELAY_MS + 60000);
    jest.setSystemTime(Date.now() + 11 * 60 * 1000);
    mockAppStateListeners.forEach((listener) => listener("active"));
    await advance(10);
    const callsAfterExpiry = readOwnClip.mock.calls.length;

    mockAppStateListeners.forEach((listener) => listener("active"));
    await advance(10);

    expect(readOwnClip).toHaveBeenCalledTimes(callsAfterExpiry);
    expect(mockPrivacy.clearCalls).toBe(0);
  });

  it("does not let a superseded clear touch a newer copy", async () => {
    const app = startApp();
    let finishRead!: (clip: IClipRead) => void;
    mockPrivacy.api!.readOwnClip = () =>
      new Promise<IClipRead>((resolve) => {
        finishRead = resolve;
      });

    app.scheduleClipboardClear(PASSWORD, DELAY_MS, false);
    await advance(DELAY_MS + 10);

    const newer = "n3w#Passw0rd&zzXY";
    mockPrivacy.clip = { status: "own", text: newer };
    mockPrivacy.api!.readOwnClip = async () => mockPrivacy.clip;
    app.scheduleClipboardClear(newer, DELAY_MS, false);

    finishRead({ status: "unavailable" });
    await advance(DELAY_MS + 50);

    expect(mockPrivacy.clearCalls).toBe(1);
  });

  describe("after the app is killed", () => {
    const copyWithFingerprint = async (app: IClipboardModule) => {
      await app.copySensitiveText(PASSWORD);
      app.scheduleClipboardClear(PASSWORD, DELAY_MS, true);
      await advance(10);
    };

    it("stores only a salted fingerprint, never the password", async () => {
      const app = startApp();
      await copyWithFingerprint(app);

      const stored = mockDisk.get("pending");
      expect(stored).toBeDefined();
      expect(stored).not.toContain(PASSWORD);
      expect(stored).not.toContain("k7Q");

      const record = JSON.parse(stored!);
      expect(record.salt).toMatch(/^[0-9a-f]{32}$/);
      expect(record.hash).toMatch(/^[0-9a-f]{64}$/);
      expect(record.text).toBeUndefined();
    });

    it("clears the clipboard on the next launch when it still holds the password", async () => {
      await copyWithFingerprint(startApp());
      jest.clearAllTimers(); // the old process and its timers are gone

      const relaunched = startApp();
      relaunched.resumeClipboardClear();
      await advance(DELAY_MS + 50);

      expect(mockPrivacy.clearCalls).toBe(1);
      expect(mockDisk.size).toBe(0);
    });

    it("clears immediately on launch when the delay has already passed", async () => {
      await copyWithFingerprint(startApp());
      jest.clearAllTimers();
      jest.setSystemTime(Date.now() + 10 * DELAY_MS);

      startApp().resumeClipboardClear();
      await advance(10);

      expect(mockPrivacy.clearCalls).toBe(1);
    });

    it("leaves the clipboard alone when it now holds something else, and drops the record", async () => {
      await copyWithFingerprint(startApp());
      jest.clearAllTimers();
      mockPrivacy.clip = { status: "own", text: "another-generated-password" };

      startApp().resumeClipboardClear();
      await advance(DELAY_MS + 50);

      expect(mockPrivacy.clearCalls).toBe(0);
      expect(mockDisk.size).toBe(0);
    });

    it("ignores a corrupt stored record", async () => {
      mockDisk.set("pending", "{not json");

      startApp().resumeClipboardClear();
      await advance(DELAY_MS);

      expect(mockPrivacy.clearCalls).toBe(0);
      expect(mockDisk.size).toBe(0);
    });

    it("ignores a stored record with the wrong shape", async () => {
      mockDisk.set("pending", JSON.stringify({ dueAt: "soon", salt: 1 }));

      startApp().resumeClipboardClear();
      await advance(DELAY_MS);

      expect(mockPrivacy.clearCalls).toBe(0);
      expect(mockDisk.size).toBe(0);
    });
  });

  it("lets a newer copy replace the older schedule and its stored record", async () => {
    const app = startApp();
    await app.copySensitiveText(PASSWORD);
    app.scheduleClipboardClear(PASSWORD, DELAY_MS, true);

    mockPrivacy.clip = { status: "own", text: "second" };
    app.scheduleClipboardClear("second", DELAY_MS, false);
    await advance(10);

    expect(mockDisk.size).toBe(0); // the older fingerprint must not linger

    await advance(DELAY_MS + 50);
    expect(mockPrivacy.clearCalls).toBe(1);
  });

  describe("without the native module", () => {
    beforeEach(() => {
      mockPrivacy.api = null;
    });

    it("falls back to a plain copy and reports that clearing is unsupported", async () => {
      const app = startApp();

      await app.copySensitiveText("secret");
      app.scheduleClipboardClear("secret", DELAY_MS, true);
      app.resumeClipboardClear();
      await advance(DELAY_MS + 50);

      expect(mockPlainCopies).toEqual(["secret"]);
      expect(app.canClearClipboard).toBe(false);
      expect(mockDisk.size).toBe(0);
    });
  });
});
