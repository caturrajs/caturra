import { ContextStack, SignalSubscriber } from "./ContextStack";

export type Signal<T> = (() => T) & { get: () => T; set: (val: T) => void };

export const createSignal = <T>(
  defaultValue: T,
  transformer?: (previous: T) => T
) => {
  const subscribers: SignalSubscriber[] = [];
  let value = defaultValue;

  ContextStack.push(() => {
    if (transformer) value = transformer(value);
    for (const sub of subscribers) {
      if (sub) sub();
    }
  });

  if (transformer) value = transformer(value);

  ContextStack.pop();

  const signal: Signal<T> = (() => {
    const context = ContextStack.peek();
    if (context && !subscribers.includes(context)) subscribers.push(context);

    return value;
  }) as any;

  signal.set = (newValue) => {
    value = newValue;
    if (transformer) value = transformer(value);

    for (const sub of subscribers) {
      if (sub) sub();
    }
  };

  return signal;
};
