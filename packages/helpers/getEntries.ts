type Entries<T> = { [K in keyof T]-?: [K, T[K]] }[keyof T][];

export const getEntries = <T extends Record<string, unknown>>(obj: T) =>
  Object.entries(obj) as Entries<T>;
export const getKeys = <T extends Record<string, unknown>>(obj: T) =>
  Object.keys(obj) as (keyof T)[];
export const getValues = <T extends Record<string, unknown>>(obj: T) =>
  Object.values(obj) as T[keyof T][];
