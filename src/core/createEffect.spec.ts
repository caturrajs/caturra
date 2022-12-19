import { describe, expect, it, vi } from "vitest";
import { createEffect } from "./createEffect";
import { createSignal } from "./createSignal";

describe("createEffect", () => {
  it("runs on setup", () => {
    const mock = vi.fn();

    createEffect(() => {
      mock();
    });

    expect(mock).toBeCalledTimes(1);
  });

  it("runs when signal updates", () => {
    const mock = vi.fn();
    const signal = createSignal(0);

    createEffect(() => {
      signal();
      mock();
    });

    signal.set(1);

    expect(mock).toBeCalledTimes(2);
  });

  it("runs each time signal updates", () => {
    const mock = vi.fn();
    const signal = createSignal(0);

    createEffect(() => {
      signal();
      mock();
    });

    signal.set(1);
    signal.set(2);
    signal.set(3);

    expect(mock).toBeCalledTimes(4);
  });

  it("handles multiple signals", () => {
    const mock = vi.fn();
    const signal1 = createSignal(0);
    const signal2 = createSignal(0);

    createEffect(() => {
      signal1();
      signal2();
      mock();
    });

    signal1.set(1);
    signal2.set(1);

    expect(mock).toBeCalledTimes(3);
  });
});
