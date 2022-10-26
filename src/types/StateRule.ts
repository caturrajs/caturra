import { TransformerNode } from "./TransformerNode";

export type StateRule<
  V,
  Root = unknown,
  Path extends (string | symbol | number)[] = []
> =
  | V
  | ((
      arg: Root &
        TransformerNode<Root, Path> & {
          $it: V;
        }
    ) => V);
