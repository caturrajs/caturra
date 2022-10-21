import { TransformerTree } from "../types/TransformerTree";

export const Snapshot = <T>(config: TransformerTree<T>) => {
  const root = {};
  Object.keys(config).forEach((key) => createSubNode(root, key));
  const ast = AbstractStateTree(config, root, root);

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
        ...root,
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
