import { requireOptionalNativeModule } from "expo";

export type IClipRead =
  | { status: "own"; text: string }
  | { status: "other" }
  | { status: "unavailable" };

interface IAppPrivacyModule {
  copySensitive: (text: string) => Promise<void>;
  readOwnClip: () => Promise<IClipRead>;
  clearClipboard: () => Promise<void>;
}

// Null when the native module is not part of the installed build (for example
// an older development build, or iOS); callers then fall back gracefully.
export default requireOptionalNativeModule<IAppPrivacyModule>("AppPrivacy");
