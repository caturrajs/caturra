import {  createSignal, Signal } from "./createSignal";
import { describe, it, expect } from "vitest";
import { createNamespace } from "./createNamespace";

describe("createSignal", () => {
  describe("signal", () => {
    it("is callable", () => {
      const signal = createSignal(undefined);

      expect(typeof signal === "function").toBe(true);
    });

    it("contains a set method", () => {
      const signal = createSignal(undefined);

      expect("set" in signal).toBe(true);
    });

    it("returns its value when called", () => {
      const signal = createSignal("value");

      expect(signal()).toEqual("value");
    });

    it("sets its value when calling set", () => {
      const signal = createSignal("value");

      signal.set("new value");

      expect(signal()).toEqual("new value");
    });

    it("uses another signals value", () => {
      const s1 = createSignal("value");
      const s2 = createSignal("", () => s1());

      expect(s2()).toEqual("value");
    });

    it("gets updated when another signal updates", () => {
      const s1 = createSignal("value");
      const s2 = createSignal("", () => s1());

      s1.set("new value");

      expect(s2()).toEqual("new value");
    });

    it("can be connected with multiple other signals", () => {
      const s1 = createSignal("");
      const s2 = createSignal("");
      const s3 = createSignal("", () => s1() + "/" + s2());

      expect(s3()).toEqual("/");

      s1.set("A");
      expect(s3()).toEqual("A/");

      s2.set("B");
      expect(s3()).toEqual("A/B");
    });

    it("can be connected with another signal through a third signal", () => {
      const s1 = createSignal("");
      const s2 = createSignal("", () => s1() + "+");
      const s3 = createSignal("", () => s2());

      s1.set("A");

      expect(s2()).toEqual("A+");
      expect(s3()).toEqual("A+");
    });

    it("can be nested within a namespace", () => {
      const field = createNamespace(() => {
        const value = createSignal(0);
        const label = createSignal(
          `Value is ${value()}`,
          () => `Value is ${value()}`
        );

        return { value, label };
      });

      expect(field.value()).toEqual(0);
      expect(field.label()).toEqual("Value is 0");

      field.value.set(100);

      expect(field.value()).toEqual(100);
      expect(field.label()).toEqual("Value is 100");
    });
  });

  it("gets the signal's value as the first parameter", () => {
    createSignal(25, (value) => {
      expect(value).toBe(25);
      return value;
    });
  });

  it("can restrict for signal's values", () => {
    const signal: Signal<number> = createSignal(0, (value) => {
      if (value > 50) return 50;
      return value;
    });

    signal.set(100);

    expect(signal()).toBe(50);
  });

  it("can handle a larger example", () => {
    const form = createNamespace(() => {
      const page1 = createNamespace(() => {
        const email = createNamespace(() => {
          const value = createSignal("");
          const label = createSignal("What is your email?");
          const isVisible = createSignal(true);
          const errors = createSignal([], () => {
            const errors = [];

            if (value() === "") errors.push({ message: "Email is required" });

            return errors;
          });

          return { value, label, isVisible, errors };
        });

        const phone = createNamespace(() => {
          const value = createSignal("");
          const label = createSignal("What is your phone number?");
          const isVisible = createSignal(false, () => !!email.value());

          return { value, label, isVisible };
        });

        return { email, phone };
      });

      return { page1 };
    });

    expect(form.page1.phone.isVisible()).toBe(false);
    expect(form.page1.email.errors()).toEqual([
      { message: "Email is required" },
    ]);

    form.page1.email.value.set("bob@example.com");

    expect(form.page1.phone.isVisible()).toBe(true);
    expect(form.page1.email.errors()).not.toEqual([
      { message: "Email is required" },
    ]);
  });
});
