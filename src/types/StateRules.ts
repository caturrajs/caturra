import { Primitive } from "./utils";
import { StateRule } from "./StateRule";

export type StateRules<
  C,
  Root = C,
  Path extends (string | number | symbol)[] = []
> = {
  [key in keyof C]: C[key] extends Primitive
    ?
        | StateRule<C[key], Root, [...Path, key]>
        | StateRule<C[key], Root, [...Path, key]>[]
    : StateRules<C[key], Root, [...Path, key]>;
};
