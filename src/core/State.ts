import { calculateNextStableSnapshot } from "./calculateNextStableSnapshot";
import { createSnapshot } from "./Snapshot";
import { StateRules } from "../types/StateRules";
import { deepClone } from "../utils";
import { freezeLatestChanges } from "./freezeLatestChanges";

export type Subscriber<T> = (update: Readonly<T>) => void;

interface State<T> {
  getSnapshot: () => T;
  subscribe: (fn: Subscriber<T>) => void;
  unsubscribe: (fn: Subscriber<T>) => void;
  mutate: (fn: (data: T) => void) => void;
  getSubState: <K extends keyof T>(
    key: K
  ) => T[K] extends Record<any, any> ? State<T[K]> : never;
}

export const createState = <T>(config: StateRules<T>): State<T> => {
  let subscribers: Subscriber<T>[] = [];
  let state = createSnapshot<T>(config);

  const self: State<T> = {
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
      const subState = createSubState(config[key] as any, self, key);
      return subState as T[typeof key] extends Record<any, any>
        ? State<T[typeof key]>
        : never;
    },
  };
  return self;
};

const createSubState = <T, K extends keyof T>(
  config: StateRules<T[K]>,
  superState: State<T>,
  key: K
): State<T[K]> => {
  let subscribers: Subscriber<T[K]>[] = [];

  superState.subscribe((snapshot) =>
    subscribers.forEach((subscriber) => subscriber(snapshot[key]))
  );

  const self: State<T[K]> = {
    subscribe(fn) {
      subscribers.push(fn);
    },
    unsubscribe(fn) {
      subscribers = subscribers.filter((sub) => sub !== fn);
    },
    getSnapshot() {
      return superState.getSnapshot()[key];
    },
    mutate(fn) {
      superState.mutate((data) => {
        fn(data[key]);
      });
    },
    getSubState(key) {
      return createSubState(config[key] as any, self, key) as any;
    },
  };

  return self;
};
