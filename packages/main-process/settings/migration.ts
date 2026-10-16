import { produce, setAutoFreeze } from "immer";
import { createMigrate } from "@sculptor/helpers/libs/migrate";

setAutoFreeze(false);

export const migrationManifest = createMigrate<any>({});
