import { useEffect, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";
import type {
  IDisplayCharacter,
  IPasswordTextProps,
  IScrambleState,
} from "./password-text.interface";
import { getNoise, getTickMs } from "./password-text.utils";

const INITIAL_STATE: IScrambleState = { key: -1, settled: 0, noise: "" };

// On regenerate, every position shows random characters that lock into the
// real password one at a time from left to right.
export default function usePasswordText(props: IPasswordTextProps) {
  const { password, animationKey, animate } = props;

  const reduceMotion = useReducedMotion();
  const [state, setState] = useState(INITIAL_STATE);

  const shouldAnimate = animate && animationKey > 0 && !reduceMotion;

  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }

    const length = password.length;
    let settled = 0;

    const intervalId = setInterval(() => {
      settled += 1;
      setState({ key: animationKey, settled, noise: getNoise(length) });

      if (settled >= length) {
        clearInterval(intervalId);
      }
    }, getTickMs(length));

    return () => clearInterval(intervalId);
  }, [shouldAnimate, animationKey, password]);

  const isCurrent = state.key === animationKey;
  const isFinished = isCurrent && state.settled >= password.length;
  const isFullySettled = !shouldAnimate || isFinished;
  const settledCount = isFullySettled
    ? password.length
    : isCurrent
      ? state.settled
      : 0;

  // Until the first tick arrives there is no noise yet, so use the password
  // reversed for that single frame.
  const noise = isCurrent
    ? state.noise
    : Array.from(password).reverse().join("");

  const characters: IDisplayCharacter[] = Array.from(password).map(
    (char, index) =>
      index < settledCount
        ? { char, settled: true }
        : { char: noise[index] ?? char, settled: false },
  );

  return { characters };
}
