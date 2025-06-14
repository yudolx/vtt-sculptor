const DEFAULT_VERSION = -1;

export interface MigrateState {
  version: number;
}

interface MigrationManifest<State> {
  [key: string]: (state: State) => State;
}

export default function createMigrate<State extends MigrateState>(
  migrations: MigrationManifest<State>,
): (state: State, currentVersion: number) => State | null {
  return function (state: State, currentVersion: number): State | null {
    if (!state) {
      console.log("migration: no inbound state, skipping migration");
      return null;
    }

    const inboundVersion: number =
      state.version !== undefined ? state.version : DEFAULT_VERSION;

    if (inboundVersion === currentVersion) {
      console.log("migration: versions match, noop migration");
      return state;
    }

    if (inboundVersion > currentVersion) {
      console.error("migration: downgrading version is not supported");
      return state;
    }

    const migrationKeys = Object.keys(migrations)
      .map((ver) => parseInt(ver))
      .filter((key) => currentVersion >= key && key > inboundVersion)
      .sort((a, b) => a - b);

    console.log("migration: migrationKeys", migrationKeys);

    try {
      const migratedState = migrationKeys.reduce((state, versionKey) => {
        console.log(`migration: running migration for v.${versionKey}`);
        return migrations[versionKey](state);
      }, state);

      return migratedState;
    } catch (err) {
      console.error(err);
      return null;
    }
  };
}
