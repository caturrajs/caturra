import { TransformerNode } from "./TransformerNode";

export type Transformer<Root, Path extends (string | symbol | number)[], V> =
  | V
  | ((
      arg: Root &
        TransformerNode<Root, Path> & {
          $self: V;
        }
    ) => V);
