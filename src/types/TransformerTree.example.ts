import { TransformerTree } from "./TransformerTree";

interface Config {
  a: {
    b: string;
  };
  c: {
    d: {
      f: number;
      g: number;
    };
  };
}

const t: TransformerTree<Config> = {
  a: {
    b: ({ c, $parent }) => c.d.f.toString() + $parent.$parent.c.d.f,
  },
  c: {
    d: {
      f: ({ $parent }) => $parent.g / 2,
      g: (args) => parseInt(args.$parent.$parent.$parent.a.b) * 2,
    },
  },
};

console.log(t);
