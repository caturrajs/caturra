import { idText } from "typescript";
import { Snapshot } from "./Snapshot";
import { it, describe, expect } from "vitest";

describe("Snapshot", () => {
  it("sets values with a function", () => {
    const snapshot = Snapshot<{ a: string }>({
      a: () => "",
    });

    expect(snapshot).toEqual({ a: "" });
  });

  it("sets values directly", () => {
    const snapshot = Snapshot<{ a: string }>({
      a: "",
    });

    expect(snapshot).toEqual({ a: "" });
  });

  it("sets values from other properties", () => {
    const snapshot = Snapshot<{ a: string; b: string }>({
      a: "a",
      b: ({ a }) => a + "b",
    });

    expect(snapshot).toEqual({ a: "a", b: "ab" });
  });

  it("sets values from other properties using relative access", () => {
    const snapshot = Snapshot<{ a: string; b: string }>({
      a: "a",
      b: ({ $parent }) => $parent.a + "b",
    });

    expect(snapshot).toEqual({ a: "a", b: "ab" });
  });

  it("sets values in nested objects", () => {
    const snapshot = Snapshot<{ a: { b: "" } }>({
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
    const snapshot = Snapshot<ISnapshot>({
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
    const snapshot = Snapshot<ISnapshot>({
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
    const snapshot = Snapshot<ISnapshot>({
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
    const snapshot = Snapshot<ISnapshot>({
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
});
