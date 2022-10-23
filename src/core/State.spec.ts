import { describe, it, expect, vi } from "vitest";
import { State } from "./State";

describe("State", () => {
  interface MinimalState {
    a: string;
  }
  it("returns the initial state", () => {
    const state = State<MinimalState>({
      a: "a",
    });

    expect(state.getSnapshot()).toEqual({
      a: "a",
    });
  });

  it("mutates state", () => {
    const state = State<MinimalState>({
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
    const state = State<MinimalState>({
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
    const state = State<MinimalState>({
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
    const state = State<MinimalState>({
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
    const state = State<MinimalState>({
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
    const state = State<MinimalState>({
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
    const state = State<MinimalState>({
      a: ({ a }) => a ?? "",
    });

    state.subscribe(fn);
    state.unsubscribe(fn);

    state.mutate((state) => {
      state.a = "updated a";
    });

    expect(fn).toBeCalledTimes(0);
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
    const state = State<NestedState>({
      secondLevel: {
        thirdLevel: {
          third: 0,
        },
        second: 0,
      },
      first: 0,
    });

    const substate = state.getSubState("secondLevel");

    expect(typeof substate).toBe("object");
    expect(substate.getSnapshot).toBeDefined();
    expect(substate.mutate).toBeDefined();
    expect(substate.subscribe).toBeDefined();
    expect(substate.unsubscribe).toBeDefined();
  });

  it("returns a new state that is updated on changes in the root state", () => {
    const state = State<NestedState>({
      secondLevel: {
        thirdLevel: {
          third: ({ $self }) => $self ?? 0,
        },
        second: ({ $self }) => $self ?? 0,
      },
      first: ({ $self }) => $self ?? 0,
    });

    const substate = state.getSubState("secondLevel");

    state.mutate((state) => {
      state.secondLevel.second = 123;
    });

    expect(substate.getSnapshot()).toEqual(state.getSnapshot().secondLevel);
    expect(substate.getSnapshot().second).toBe(123);
  });

  it("returns a new state that syncs changes to the root state", () => {
    const state = State<NestedState>({
      secondLevel: {
        thirdLevel: {
          third: ({ $self }) => $self ?? 0,
        },
        second: ({ $self }) => $self ?? 0,
      },
      first: ({ $self }) => $self ?? 0,
    });

    const substate = state.getSubState("secondLevel");

    substate.mutate((state) => {
      state.second = 123;
    });

    expect(substate.getSnapshot()).toEqual(state.getSnapshot().secondLevel);
    expect(state.getSnapshot().secondLevel.second).toBe(123);
  });

  it("can be chained to access deeply nested properties", () => {
    const state = State<NestedState>({
      secondLevel: {
        thirdLevel: {
          third: ({ $self }) => $self ?? 0,
        },
        second: ({ $self }) => $self ?? 0,
      },
      first: ({ $self }) => $self ?? 0,
    });

    const substate = state.getSubState("secondLevel").getSubState("thirdLevel");

    substate.mutate((state) => {
      state.third = 123;
    });

    expect(substate.getSnapshot()).toEqual(
      state.getSnapshot().secondLevel.thirdLevel
    );
    expect(state.getSnapshot().secondLevel.thirdLevel.third).toBe(123);

    state.mutate((state) => {
      state.secondLevel.thirdLevel.third = 1;
    });

    expect(substate.getSnapshot()).toEqual(
      state.getSnapshot().secondLevel.thirdLevel
    );
    expect(substate.getSnapshot().third).toBe(1);
  });
});
