import { Primitive } from "../types/utils";
import { calculateNextStableSnapshot } from "./calculateNextStableSnapshot";
import { Snapshot } from "./Snapshot";
import { TransformerTree } from "../types/TransformerTree";
import { deepClone } from "../utils";
import { RemovePrimitiveProperties } from "../types/RemovePrimitiveProperties";
import { CollapseObject } from "../types/CollapseObject";

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

export const State = <T>(config: TransformerTree<T>): State<T> => {
  let subscribers: Subscriber<T>[] = [];
  let state = Snapshot<T>(config);

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
      state = calculateNextStableSnapshot(config, out);

      subscribers.forEach((subscriber) => subscriber(state));
    },
    getSubState(key) {
      const substate = State<T[typeof key]>(config[key] as any);

      const updateSubState: Subscriber<any> = (state) => {
        substate.mutate((substate) => {
          for (const k in substate) {
            substate[k] = state[key][k];
          }
        });
      };

      substate.subscribe((substate) => {
        state[key] = substate;
        subscribers
          .filter((subscriber) => subscriber !== updateSubState)
          .forEach((subscriber) => subscriber(state));
      });

      this.subscribe(updateSubState);

      return substate;
    },
  };
};
