
export type Primitive = string | number | bigint | boolean | symbol | null | undefined;

export type FilterLastElement<Arr extends unknown[]> = Arr extends [
  ...infer R,
  unknown
]
  ? [...R]
  : [];

export type FilterFirstElement<Arr extends unknown[]> = Arr extends [
  unknown,
  ...infer R
]
  ? [...R]
  : [];
