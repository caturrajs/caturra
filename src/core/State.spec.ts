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

    expect(state.getState()).toEqual({
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

    expect(state.getState()).toEqual({
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

    expect(state.getState()).toEqual({
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

    expect(state.getState()).toEqual({
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
