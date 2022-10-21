import { FilterFirstElement, FilterLastElement, Primitive } from "./utils";

type Traverse<Root, Path extends unknown[]> = Path extends [infer K, ...infer R]
  ? K extends keyof Root
    ? Traverse<Root[K], FilterFirstElement<Path>>
    : undefined
  : Root;

export type TransformerNode<
  Root,
  Path extends (string | symbol | number)[]
> = (Path extends []
  ? {}
  : {
      $parent: TransformerNode<Root, FilterLastElement<Path>>;
    }) &
  Traverse<Root, Path>;
