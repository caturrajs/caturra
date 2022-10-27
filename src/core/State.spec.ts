import { StateRule } from "../types/StateRule";
import { describe, it, expect, vi } from "vitest";
import { createState } from "./State";
import { n } from "vitest/dist/index-40e0cb97";

describe("State", () => {
  interface MinimalState {
    a: string;
  }
  it("returns the initial state", () => {
    const state = createState<MinimalState>({
      a: "a",
    });

    expect(state.getSnapshot()).toEqual({
      a: "a",
    });
  });

  it("mutates state", () => {
    const state = createState<MinimalState>({
      a: ({ a }) => (a ? a : ""),
    });

    state.mutate((state) => {
      state.a = "updated a";
    });

    expect(state.getSnapshot()).toEqual({
      a: "updated a",
    });
  });

  it("keeps constant values when mutating", () => {
    const state = createState<MinimalState>({
      a: "a",
    });

    state.mutate((state) => {
      state.a = "updated a";
    });

    expect(state.getSnapshot()).toEqual({
      a: "a",
    });
  });

  it("transforms after mutate", () => {
    const state = createState<MinimalState>({
      a: ({ a }) => (a ? a[0] : ""),
    });

    state.mutate((state) => {
      state.a = "updated a";
    });

    expect(state.getSnapshot()).toEqual({
      a: "u",
    });
  });

  it("updates subscriber once when values change", () => {
    const fn = vi.fn();
    const state = createState<MinimalState>({
      a: ({ a }) => a ?? "",
    });

    state.subscribe(fn);

    state.mutate((state) => {
      state.a = "updated a";
    });

    expect(fn).toBeCalledTimes(1);
  });

  it("updates subscriber with the new state", () => {
    const fn = vi.fn();
    const state = createState<MinimalState>({
      a: ({ a }) => a ?? "",
    });

    state.subscribe(fn);

    state.mutate((state) => {
      state.a = "updated a";
    });

    expect(fn).toHaveBeenCalledWith({
      a: "updated a",
    });
  });

  it("updates multiple subscribers", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const state = createState<MinimalState>({
      a: ({ a }) => a ?? "",
    });

    state.subscribe(fn1);
    state.subscribe(fn2);

    state.mutate((state) => {
      state.a = "updated a";
    });

    expect(fn1).toBeCalledTimes(1);
    expect(fn2).toBeCalledTimes(1);
  });

  it("stops updating after unsubscribing", () => {
    const fn = vi.fn();
    const state = createState<MinimalState>({
      a: ({ a }) => a ?? "",
    });

    state.subscribe(fn);
    state.unsubscribe(fn);

    state.mutate((state) => {
      state.a = "updated a";
    });

    expect(fn).toBeCalledTimes(0);
  });

  it("allows setting fields from null values", () => {
    const state = createState<MinimalState>({
      a: ({ a }) => a ?? null,
    });

    state.mutate((state) => {
      state.a = "set a";
    });

    expect(state.getSnapshot()).toEqual({ a: "set a" });
  });

  it("syncs two fields in the direction they are defined", () => {
    interface State {
      a: string;
      b: string;
    }
    const state = createState<State>({
      a: ({ b }) => b,
      b: ({ a }) => a,
    });

    state.mutate((state) => {
      state.a = "set a";
    });

    expect(state.getSnapshot()).toEqual({ a: "set a", b: "set a" });
  });

  it("syncs two fields in the opposite direction to how they are defined", () => {
    interface IState {
      a: string;
      b: string;
    }
    const state = createState<IState>({
      a: ({ b }) => b,
      b: ({ a }) => a,
    });

    state.mutate((state) => {
      state.b = "set b";
    });

    expect(state.getSnapshot()).toEqual({ a: "set b", b: "set b" });
  });

  it("keeps transformers clojure", () => {
    interface IState {
      a: string;
      b: number;
    }
    const countChangesInA = (): StateRule<number, IState, ["b"]> => {
      let updates = 0;
      let prev: string | undefined = undefined;

      return ({ a }) => {
        if (a !== prev) updates++;
        prev = a;
        return updates;
      };
    };

    const state = createState<IState>({
      a: ({ $it }) => $it ?? "default",
      b: countChangesInA(),
    });

    state.mutate((state) => {
      state.a = "default";
    });
    state.mutate((state) => {
      state.a = "";
    });

    expect(state.getSnapshot()).toEqual({ a: "", b: 2 });
  });
});

describe("state.getSubState", () => {
  interface NestedState {
    secondLevel: {
      thirdLevel: {
        third: number;
      };
      second: number;
    };
    first: number;
  }

  it("returns a new object with the correct methods", () => {
    const state = createState<NestedState>({
      secondLevel: {
        thirdLevel: {
          third: 0,
        },
        second: 0,
      },
      first: 0,
    });

    const subState = state.getSubState("secondLevel");

    expect(typeof subState).toBe("object");
    expect(subState.getSnapshot).toBeDefined();
    expect(subState.mutate).toBeDefined();
    expect(subState.subscribe).toBeDefined();
    expect(subState.unsubscribe).toBeDefined();
  });

  it("returns a new state that is updated on changes in the root state", () => {
    const state = createState<NestedState>({
      secondLevel: {
        thirdLevel: {
          third: ({ $it }) => $it ?? 0,
        },
        second: ({ $it }) => $it ?? 0,
      },
      first: ({ $it }) => $it ?? 0,
    });

    const subState = state.getSubState("secondLevel");

    state.mutate((state) => {
      state.secondLevel.second = 123;
    });

    expect(subState.getSnapshot()).toEqual(state.getSnapshot().secondLevel);
    expect(subState.getSnapshot().second).toBe(123);
  });

  it("returns a new state that syncs changes to the root state", () => {
    const state = createState<NestedState>({
      secondLevel: {
        thirdLevel: {
          third: ({ $it }) => $it ?? 0,
        },
        second: ({ $it }) => $it ?? 0,
      },
      first: ({ $it }) => $it ?? 0,
    });

    const subState = state.getSubState("secondLevel");

    subState.mutate((state) => {
      state.second = 123;
    });

    expect(subState.getSnapshot()).toEqual(state.getSnapshot().secondLevel);
    expect(state.getSnapshot().secondLevel.second).toBe(123);
  });

  it("can be chained to access deeply nested properties", () => {
    const state = createState<NestedState>({
      secondLevel: {
        thirdLevel: {
          third: ({ $it }) => $it ?? 0,
        },
        second: ({ $it }) => $it ?? 0,
      },
      first: ({ $it }) => $it ?? 0,
    });

    const subState = state.getSubState("secondLevel").getSubState("thirdLevel");

    subState.mutate((state) => {
      state.third = 123;
    });

    expect(subState.getSnapshot()).toEqual(
      state.getSnapshot().secondLevel.thirdLevel
    );
    expect(state.getSnapshot().secondLevel.thirdLevel.third).toBe(123);

    state.mutate((state) => {
      state.secondLevel.thirdLevel.third = 1;
    });

    expect(subState.getSnapshot()).toEqual(
      state.getSnapshot().secondLevel.thirdLevel
    );
    expect(subState.getSnapshot().third).toBe(1);
  });

  it("can handle lots of sub states without RangeError", () => {
    interface ComplexState {
      one: {
        two: {
          a: number;
        };
        three: {
          a: number;
        };
        four: {
          a: number;
        };
      };
    }
    const state = createState<ComplexState>({
      one: {
        two: {
          a: ({ $it }) => $it ?? 0,
        },
        three: {
          a: ({ $it }) => $it ?? 0,
        },
        four: {
          a: ({ $it }) => $it ?? 0,
        },
      },
    });

    for (let i = 0; i < 100; i++) {
      state.getSubState("one").getSubState("two");
      state.getSubState("one").getSubState("three");
      state.getSubState("one").getSubState("four");
    }

    expect(() => {
      state.mutate((data) => {
        data.one.two.a = 100;
      });
    }).not.toThrow();
  });
});
