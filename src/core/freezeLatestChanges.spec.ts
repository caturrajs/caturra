import { freezeLatestChanges } from "./freezeLatestChanges";
import { describe, it, expect } from "vitest";
import { Transformer } from "../types/Transformer";

describe("freezeLatestChanges", () => {
  it("returns a config with static transformers where the property changed", () => {
    interface MinimalState {
      a: number;
    }
    const out = freezeLatestChanges<MinimalState>({
      before: { a: 0 },
      after: { a: 1 },
      config: { a: ({ a }) => a + 1 },
    });

    expect(out).toEqual({ a: 1 });
  });

  it("keeps transformers when the property has not changed", () => {
    interface MinimalState {
      a: number;
    }
    const transformer: Transformer<any, any, number> = ({ a }) => a + 1;
    const out = freezeLatestChanges<MinimalState>({
      before: { a: 0 },
      after: { a: 0 },
      config: { a: transformer },
    });

    expect(out.a).toBe(transformer);
  });

  it("works recursively", () => {
    interface RecursiveState {
      a: {
        b: {
          c: number;
        };
      };
    }
    const transformer: Transformer<any, any, number> = ({ a }) => a + 1;
    const out = freezeLatestChanges<RecursiveState>({
      before: { a: { b: { c: 0 } } },
      after: { a: { b: { c: 1 } } },
      config: { a: { b: { c: transformer } } },
    });

    expect(out).toEqual({ a: { b: { c: 1 } } });
  });
});
