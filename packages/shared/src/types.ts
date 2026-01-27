import { QueryKey } from "@sculptor/helpers/constants";
import type { DeepPartial } from "@sculptor/helpers/typeUtils";

export interface IPluginEditorToolboxComponentProps {
  textAreaEl: HTMLTextAreaElement | null;
}

export interface IPluginSettingsComponentProps<T> {
  settings: T;
  onChange: (newSettings: DeepPartial<T>) => void;
}

export interface IPluginImplementation<Settings> {
  id: string;
  name: string;
  description: string;
  path: string;
  getSettings(existingSettings: Settings | null): Settings;
}
