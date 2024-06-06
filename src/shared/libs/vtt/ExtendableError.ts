export class ExtendableError extends Error {
  constructor(...args: Parameters<ErrorConstructor>) {
    super(...args);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
