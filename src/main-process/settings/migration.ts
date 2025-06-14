import { produce } from "immer";
import createMigrate from "shared/libs/migrate";
import { ISettings } from "./types";

export const migrationManifest = createMigrate<ISettings>({
  2: (state) =>
    produce(state, (draft) => {
      draft.windowsState.cueSplit = {
        width: 400,
        height: 300,
      };
    }),
});
