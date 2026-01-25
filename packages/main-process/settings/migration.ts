import { createMigrate } from "@sculptor/helpers/libs/migrate";
import { ISettings } from "./types";

export const migrationManifest = createMigrate<ISettings>({});
