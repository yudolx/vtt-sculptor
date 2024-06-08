export type GenPromise<Func extends (...args: any[]) => Promise<any>> = Awaited<
  ReturnType<Func>
>;
