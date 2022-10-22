import { Snapshot } from "./Snapshot";
import { TransformerTree } from "../types/TransformerTree";
import { deepClone } from "../utils";

export const calculateNextStableSnapshot = <T>(
  config: TransformerTree<T>,
  start: T
) => {
  let a = start,
    b = Snapshot(config, start);

  let counter = 0;
  do {
    if (counter > 20)
      throw Error("Updated too many times. This is probably an infinite loop.");

    a = b;
    b = Snapshot(config, deepClone(a));

    counter++;
  } while (!deepEquals(a, b));

  return b;
};

const deepEquals = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);
