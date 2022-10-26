import { createSnapshot } from "./Snapshot";
import { StateRules } from "../types/StateRules";
import { deepClone } from "../utils";

export const calculateNextStableSnapshot = <T>({
  config,
  firstRunConfig,
  initialValue,
}: {
  config: StateRules<T>;
  firstRunConfig?: StateRules<T>;
  initialValue: T;
}) => {
  let a = initialValue,
    b = createSnapshot(firstRunConfig ?? config, initialValue);

  let counter = 0;
  do {
    if (counter > 20)
      throw Error("Updated too many times. This is probably an infinite loop.");

    a = b;
    b = createSnapshot(config, deepClone(a));

    counter++;
  } while (!deepEquals(a, b));

  return b;
};

const deepEquals = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);
