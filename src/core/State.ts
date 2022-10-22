import { calculateNextStableSnapshot } from "./calculateNextStableSnapshot";
import { Snapshot } from "./Snapshot";
import { TransformerTree } from "../types/TransformerTree";
import { deepClone } from "../utils";
type Subscriber<T> = (update: T) => void;

interface State<T> {
  getState: () => T;
  subscribe: (fn: Subscriber<Readonly<T>>) => void;
  unsubscribe: (fn: Subscriber<Readonly<T>>) => void;
  mutate: (fn: (data: T) => void) => void;
}
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
    getState() {
      return state;
    },
    mutate(fn) {
      const out = deepClone(state);
      fn(out);
      state = calculateNextStableSnapshot(config, out);

      subscribers.forEach((sub) => sub(state));
    },
  };
};
