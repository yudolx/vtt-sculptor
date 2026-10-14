import { produce, setAutoFreeze } from "immer";
import { createMigrate } from "@sculptor/helpers/libs/migrate";
import { ISettings } from "./types";

setAutoFreeze(false);

export const migrationManifest = createMigrate<ISettings>({
  4: (state) =>
    produce(state, (draft) => {
      draft.general.development ??= {
        displayCueId: false,
      };
      draft.general.development.displayCueId = false;
      draft.version = 4;
    }),
});
