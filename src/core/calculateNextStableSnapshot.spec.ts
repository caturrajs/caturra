import { Snapshot } from "./Snapshot";
import { calculateNextStableSnapshot } from "./calculateNextStableSnapshot";
import { describe, it, expect } from "vitest";

describe("State", () => {
  it("happy path", () => {
    interface IState {
      a: string;
      b: string;
    }
    const start = Snapshot<IState>({ a: "", b: "" });
    const state = calculateNextStableSnapshot<IState>(start, {
      a: "",
      b: "",
    });

    expect(state).toEqual({ a: "", b: "" });
  });

  it("runs until state is stable", () => {
    interface IState {
      a: number;
    }
    const start = Snapshot<IState>({ a: 0 });
    const state = calculateNextStableSnapshot<IState>(start, {
      a: ({ a }) => (a < 5 ? a + 1 : a),
    });

    expect(state).toEqual({ a: 5 });
  });

  it("syncs fields", () => {
    interface IState {
      a: number;
      b: number;
    }
    const start = Snapshot<IState>({ a: 0, b: 0 });
    const state = calculateNextStableSnapshot<IState>(start, {
      a: ({ b }) => b,
      b: ({ a }) => (a < 5 ? a + 1 : a),
    });

    expect(state).toEqual({ a: 5, b: 5 });
  });

  it("throws an error on infinite loops", () => {
    interface IState {
      a: number;
    }
    const start = Snapshot<IState>({ a: 0 });

    const t = () => {
      const state = calculateNextStableSnapshot<IState>(start, {
        a: ({ a }) => a + 1,
      });
    };

    expect(t).toThrow();
  });
});
