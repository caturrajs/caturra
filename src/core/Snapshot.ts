import { deepClone } from "../utils";
import { TransformerTree } from "../types/TransformerTree";

export const createSnapshot = <T>(config: TransformerTree<T>, previous?: T) => {
  if (!previous) {
    previous = createEmptyAbstractStateTree(config);
  }

  const ast = createAbstractStateTree(config, previous, previous);

  return strip(ast);
};

const createEmptyAbstractStateTree = <T>(
  config: TransformerTree<T>,
  root: any = {},
  node: any = root
) => {
  for (const key in config) {
    const transformer = config[key];

    if (typeof transformer === "object" && !Array.isArray(transformer)) {
      node[key] = createAbstractStateTree(
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

const createAbstractStateTree = <T>(
  config: TransformerTree<T>,
  root: any,
  node: any
) => {
  for (const key in config) {
    const transformer = config[key];

    if (Array.isArray(transformer)) {
      let i = 0;
      for (let t of transformer) {
        node[key] = t({
          ...strip(deepClone(root)),
          $parent: node,
          $this: node[key],
        });
      }
    } else if (typeof transformer === "object") {
      node[key] = createAbstractStateTree(
        transformer as TransformerTree<any>,
        root,
        createSubNode(node, key)
      );
    } else if (typeof transformer === "function") {
      node[key] = transformer({
        ...strip(deepClone(root)),
        $parent: node,
        $this: node[key],
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
