/**
 * Removes all non-object properties from an object.
 * E.g. { a: 1, b: {} } becomes { b: {} }
 */
export type RemovePrimitiveProperties<T> = {
  [Key in keyof T as T[Key] extends Record<any, any> ? Key : never]: T[Key];
};
