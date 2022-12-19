import { ContextStack, SignalSubscriber } from "./ContextStack";

export const createEffect = (effect: () => unknown) => {
  const subscribers: SignalSubscriber[] = [];

  ContextStack.push(() => {
    effect();
    for (const sub of subscribers) {
      if (sub) sub();
    }
  });

  effect();

  ContextStack.pop();
};
