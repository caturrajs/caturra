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

export type RelativeStateRule<
  V,
  RelativeRoot,
  Path extends (string | symbol | number)[] = [keyof RelativeRoot]
> =
  | V
  | ((
      arg: TransformerNode<RelativeRoot, Path> & {
        $it: V;
      }
    ) => V);
