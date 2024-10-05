export const safeHasOwnProperty = <PropName extends PropertyKey>(
  data: unknown,
  propName: PropName,
): data is Record<PropName, unknown> =>
  Object.prototype.hasOwnProperty.call(data, propName);
