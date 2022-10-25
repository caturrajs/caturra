import { Primitive } from "../types/utils";
import { calculateNextStableSnapshot } from "./calculateNextStableSnapshot";
import { createSnapshot } from "./Snapshot";
import { TransformerTree } from "../types/TransformerTree";
import { deepClone } from "../utils";
import { RemovePrimitiveProperties } from "../types/RemovePrimitiveProperties";
import { CollapseObject } from "../types/CollapseObject";
import { freezeLatestChanges } from "./freezeLatestChanges";

export type Subscriber<T> = (update: Readonly<T>) => void;

interface State<T> {
  getSnapshot: () => T;
  subscribe: (fn: Subscriber<T>) => void;
  unsubscribe: (fn: Subscriber<T>) => void;
  mutate: (fn: (data: T) => void) => void;
  getSubState: SubStateGetter<T>;
}

export type SubStateGetter<T> = CollapseObject<{
  [Key in keyof RemovePrimitiveProperties<T>]: (key: Key) => State<T[Key]>;
}>;

export const createState = <T>(config: TransformerTree<T>): State<T> => {
  let subscribers: Subscriber<T>[] = [];
  let state = createSnapshot<T>(config);

  return {
    subscribe(fn) {
      subscribers.push(fn);
    },
    unsubscribe(fn) {
      subscribers = subscribers.filter((sub) => sub !== fn);
    },
    getSnapshot() {
      return state;
    },
    mutate(fn) {
      const out = deepClone(state);
      fn(out);
      const configWithFrozenUserChanges = freezeLatestChanges({
        before: state,
        after: out,
        config,
      });
      state = calculateNextStableSnapshot({
        config,
        firstRunConfig: configWithFrozenUserChanges,
        initialValue: out,
      });

      subscribers.forEach((subscriber) => subscriber(state));
    },
    getSubState(key) {
      const subState = createState<T[typeof key]>(config[key] as any);

      const updateSubState: Subscriber<any> = (state) => {
        subState.mutate((subState) => {
          for (const k in subState) {
            subState[k] = state[key][k];
          }
        });
      };

      subState.subscribe((subState) => {
        state[key] = subState;
        subscribers
          .filter((subscriber) => subscriber !== updateSubState)
          .forEach((subscriber) => subscriber(state));
      });

      this.subscribe(updateSubState);

      return subState;
    },
  };
};
