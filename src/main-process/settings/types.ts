import { Rectangle } from "electron";

export interface ISettings {
  windowsState: {
    main: Partial<Rectangle>;
    settings: Partial<Rectangle>;
  };
  externalCueIds: string[];
  generalSettings: {
    tryDuete: boolean;
  };
}
