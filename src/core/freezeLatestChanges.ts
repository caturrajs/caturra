import { StateRules } from "../types/StateRules";

interface IFreezeLastChanges<T> {
  before: T;
  after: T;
  config: StateRules<T>;
}
/**
 * In order to enable bi-directional syncing of fields we have to freeze the
 * previous changes for a single update cycle.
 *
 * Without this, if A should equal B and B should
 * equal A, then depending on which gets updated and which transformer runs
 * first, we could get a situation where A is updated by the user, and then A's
 * transformer is ran before B's transformer, resulting in A getting B's old
 * value, which in this case also is A's old value (since they should equal).
 * This means that the user would not be able to set the value of A directly,
 * only through setting B.
 */
export const freezeLatestChanges = <T>({
  before,
  after,
  config,
}: IFreezeLastChanges<T>) => {
  const out = {} as any;

  for (const key in config) {
    if (typeof config[key] === "object") {
      out[key] = freezeLatestChanges({
        before: before[key],
        after: after[key],
        config: config[key] as any,
      });
    } else if (before[key] !== after[key]) {
      out[key] = after[key];
    } else {
      out[key] = config[key];
    }
  }

  return out as StateRules<T>;
};
