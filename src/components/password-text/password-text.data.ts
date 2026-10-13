import type { IScrambleState } from "./password-text.interface";

export const INITIAL_STATE: IScrambleState = {
  key: -1,
  settled: 0,
  noise: "",
};
