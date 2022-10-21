import { Primitive } from "./utils";
import { Transformer } from "./Transformer";

export type TransformerTree<
  C,
  Root = C,
  Path extends (string | number | symbol)[] = []
> = {
  [key in keyof C]: C[key] extends Primitive
    ? Transformer<Root, [...Path, key], C[key]>
    : TransformerTree<C[key], Root, [...Path, key]>;
};
