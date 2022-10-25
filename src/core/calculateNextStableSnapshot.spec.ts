import { createSnapshot } from "./Snapshot";
import { calculateNextStableSnapshot } from "./calculateNextStableSnapshot";
import { describe, it, expect } from "vitest";

describe("State", () => {
  it("happy path", () => {
    interface IState {
      a: string;
      b: string;
    }
    const start = createSnapshot<IState>({ a: "", b: "" });
    const state = calculateNextStableSnapshot<IState>({
      config: {
        a: "",
        b: "",
      },
      initialValue: start,
    });

    expect(state).toEqual({ a: "", b: "" });
  });

  it("runs until state is stable", () => {
    interface IState {
      a: number;
    }
    const start = createSnapshot<IState>({ a: 0 });
    const state = calculateNextStableSnapshot<IState>({
      config: {
        a: ({ a }) => (a < 5 ? a + 1 : a),
      },
      initialValue: start,
    });

    expect(state).toEqual({ a: 5 });
  });

  it("syncs fields", () => {
    interface IState {
      a: number;
      b: number;
    }
    const start = createSnapshot<IState>({ a: 0, b: 0 });
    const state = calculateNextStableSnapshot<IState>({
      config: {
        a: ({ b }) => b,
        b: ({ a }) => (a < 5 ? a + 1 : a),
      },
      initialValue: start,
    });

    expect(state).toEqual({ a: 5, b: 5 });
  });

  it("throws an error on infinite loops", () => {
    interface IState {
      a: number;
    }
    const start = createSnapshot<IState>({ a: 0 });

    const t = () => {
      calculateNextStableSnapshot<IState>({
        config: {
          a: ({ a }) => a + 1,
        },
        initialValue: start,
      });
    };

    expect(t).toThrow();
  });
});
