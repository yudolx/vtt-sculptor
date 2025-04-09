import { safeHasOwnProperty } from "shared/safe-has-own-property";

export interface IPlaceholderCue {
  uuid: string;
  timestamp: number;
  type: "placeholder";
}

export const isPlaceholderCue = (data: unknown): data is IPlaceholderCue => {
  return (
    safeHasOwnProperty(data, "type") &&
    safeHasOwnProperty(data, "timestamp") &&
    safeHasOwnProperty(data, "uuid") &&
    data.type === "placeholder"
  );
};

export const isNotPlaceholderCue = <T>(
  data: T,
): data is Exclude<T, IPlaceholderCue> => {
  return !isPlaceholderCue(data);
};
