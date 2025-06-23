export const notNull = <T>(data: T | null): data is Exclude<T, null> =>
  data !== null;
