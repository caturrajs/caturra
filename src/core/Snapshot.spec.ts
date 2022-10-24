import { createSnapshot } from "./Snapshot";
import { it, describe, expect } from "vitest";
import { Transformer } from "../types/Transformer";

describe("Snapshot", () => {
  it("sets values with a function", () => {
    const snapshot = createSnapshot<{ a: string }>({
      a: () => "",
    });

    expect(snapshot).toEqual({ a: "" });
  });

  it("sets values directly", () => {
    const snapshot = createSnapshot<{ a: string }>({
      a: "",
    });

    expect(snapshot).toEqual({ a: "" });
  });

  it("sets values from other properties", () => {
    const snapshot = createSnapshot<{ a: string; b: string }>({
      a: "a",
      b: ({ a }) => a + "b",
    });

    expect(snapshot).toEqual({ a: "a", b: "ab" });
  });

  it("sets values from other properties using relative access", () => {
    const snapshot = createSnapshot<{ a: string; b: string }>({
      a: "a",
      b: ({ $parent }) => $parent.a + "b",
    });

    expect(snapshot).toEqual({ a: "a", b: "ab" });
  });

  it("sets values in nested objects", () => {
    const snapshot = createSnapshot<{ a: { b: "" } }>({
      a: {
        b: "",
      },
    });

    expect(snapshot).toEqual({ a: { b: "" } });
  });

  it("sets values from other properties in nested objects", () => {
    interface ISnapshot {
      a: {
        b: string;
      };
      c: {
        d: string;
      };
    }
    const snapshot = createSnapshot<ISnapshot>({
      a: {
        b: "a.b",
      },
      c: {
        d: ({ a }) => a.b + "c.d",
      },
    });

    expect(snapshot).toEqual({
      a: {
        b: "a.b",
      },
      c: {
        d: "a.bc.d",
      },
    });
  });

  it("sets values from other properties in nested objects using relative access", () => {
    interface ISnapshot {
      a: {
        b: string;
      };
      c: {
        d: string;
      };
    }
    const snapshot = createSnapshot<ISnapshot>({
      a: {
        b: "a.b",
      },
      c: {
        d: (self) => self.$parent.$parent.a.b + "c.d",
      },
    });

    expect(snapshot).toEqual({
      a: {
        b: "a.b",
      },
      c: {
        d: "a.bc.d",
      },
    });
  });

  it("sets values from other properties in nested objects using relative access more nesting", () => {
    interface ISnapshot {
      a: {
        b: {
          c: string;
        };
      };
      d: {
        e: {
          f: string;
        };
      };
    }
    const snapshot = createSnapshot<ISnapshot>({
      a: {
        b: {
          c: "a.b.c",
        },
      },
      d: {
        e: {
          f: (self) => self.$parent.$parent.$parent.a.b.c + "d.e.f",
        },
      },
    });

    expect(snapshot).toEqual({
      a: {
        b: {
          c: "a.b.c",
        },
      },
      d: {
        e: {
          f: "a.b.cd.e.f",
        },
      },
    });
  });

  it("sets values from other sibling properties in nested objects with more nesting", () => {
    interface ISnapshot {
      a: {
        b: {
          c: string;
          d: string;
        };
      };
    }
    const snapshot = createSnapshot<ISnapshot>({
      a: {
        b: {
          c: "a.b.c",
          d: ({ a }) => a.b.c + "a.b.d",
        },
      },
    });

    expect(snapshot).toEqual({
      a: {
        b: {
          c: "a.b.c",
          d: "a.b.ca.b.d",
        },
      },
    });
  });

  it("sets values  from previous snapshot", () => {
    interface ISnapshot {
      a: string;
      b: string;
    }
    const previous = createSnapshot<ISnapshot>({
      a: "a0",
      b: "b0",
    });

    const snapshot = createSnapshot<ISnapshot>(
      {
        a: (args) => args.b + "a1",
        b: "b1",
      },
      previous
    );

    expect(snapshot).toEqual({
      a: "b0a1",
      b: "b1",
    });
  });

  it("sets values reflexively from previous snapshot", () => {
    interface ISnapshot {
      a: number;
    }
    const previous = createSnapshot<ISnapshot>({
      a: 0,
    });

    const snapshot = createSnapshot<ISnapshot>(
      {
        a: ({ a }) => a + 1,
      },
      previous
    );

    expect(snapshot).toEqual({
      a: 1,
    });
  });

  it("sets values reflexively from previous snapshot using $this", () => {
    interface ISnapshot {
      a: number;
    }
    const previous = createSnapshot<ISnapshot>({
      a: 0,
    });

    const snapshot = createSnapshot<ISnapshot>(
      {
        a: ({ $this }) => $this + 1,
      },
      previous
    );

    expect(snapshot).toEqual({
      a: 1,
    });
  });

  it("allows multiple transformers", () => {
    interface ISnapshot {
      a: number;
    }

    const init =
      <T>(init: T): Transformer<any, any, T> =>
      ({ $this }) =>
        $this ?? init;

    const min =
      <T>(min: T): Transformer<any, any, T> =>
      ({ $this }) =>
        $this < min ? min : $this;

    const snapshot = createSnapshot<ISnapshot>({
      a: [init(0), min(5)],
    });

    expect(snapshot.a).toBe(5);
  });

  it("multiple transformers update node tree between each transformer", () => {
    interface ISnapshot {
      a: number;
    }

    const snapshot = createSnapshot<ISnapshot>({
      a: [() => 10, ({ a }) => (a < 5 ? 5 : a)],
    });

    expect(snapshot.a).toBe(10);
  });
});
