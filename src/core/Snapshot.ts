import { deepClone } from "../utils";
import { TransformerTree } from "../types/TransformerTree";

export const Snapshot = <T>(config: TransformerTree<T>, previous?: T) => {
  if (!previous) {
    previous = createEmptyAbstractStateTree(config);
  }

  const ast = AbstractStateTree(config, previous, previous);

  return strip(ast);
};

const createEmptyAbstractStateTree = <T>(
  config: TransformerTree<T>,
  root: any = {},
  node: any = root
) => {
  for (const key in config) {
    const transformer = config[key];

    if (typeof transformer === "object") {
      node[key] = AbstractStateTree(
        transformer as TransformerTree<any>,
        root,
        createSubNode(node, key)
      );
    } else {
      node[key] = null;
    }
  }

  return node as T;
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
        $self: node[key],
      });
    } else {
      node[key] = transformer;
    }
  }

  return node as T;
};

const createSubNode = (parent: any, key: keyof typeof parent) => {
  const sub = {
    ...parent[key],
    $parent: parent,
  };

  parent[key] = sub;

  return sub;
};

const strip = (obj: any) => {
  if (typeof obj !== "object" || !obj) return;

  if ("$parent" in obj) delete obj.$parent;

  Object.values(obj).forEach((sub) => strip(sub));

  return obj;
};
