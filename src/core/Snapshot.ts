import { deepClone } from "../utils";
import { TransformerTree } from "../types/TransformerTree";

export const Snapshot = <T>(config: TransformerTree<T>, previous?: T) => {
  if (!previous) {
    previous = {} as T;
    Object.keys(config).forEach((key) => createSubNode(previous, key));
  }
  const ast = AbstractStateTree(config, previous, previous);

  return strip(ast);
};

const AbstractStateTree = <T>(
  config: TransformerTree<T>,
  root: any,
  node: any
) => {
  for (const key in config) {
    const transformer = config[key];

    if (typeof transformer === "object") {
      node[key] = AbstractStateTree(
        transformer as TransformerTree<any>,
        root,
        createSubNode(node, key)
      );
    } else if (typeof transformer === "function") {
      node[key] = transformer({
        ...strip(deepClone(root)),
        $parent: node,
      });
    } else {
      node[key] = transformer;
    }
  }

  return node as T;
};

const createSubNode = (parent: any, key: keyof typeof parent) => {
  const sub = {
    $parent: parent,
  };

  parent[key] = sub;

  return sub;
};

const strip = (obj: any) => {
  if (typeof obj !== "object") return;

  delete obj.$parent;

  Object.values(obj).forEach((sub) => strip(sub));

  return obj;
};
