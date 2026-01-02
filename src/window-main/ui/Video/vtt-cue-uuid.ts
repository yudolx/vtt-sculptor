import { IVTTCue } from "@thulean-archives/shared/vtt/vttcue";

export class VTTCueUuid extends VTTCue {
  static is(data: unknown): data is VTTCueUuid {
    return data instanceof VTTCueUuid;
  }

  static createFromCueObj(cueArg: IVTTCue) {
    const cue = new VTTCueUuid(
      cueArg.startTime,
      cueArg.endTime,
      cueArg.text,
      cueArg.uuid,
    );
    cue.update(cueArg);
    return cue;
  }

  public uuid: string;
  constructor(
    ...[start, end, text, uuid]: [
      ...ConstructorParameters<typeof VTTCue>,
      uuid: string,
    ]
  ) {
    super(start, end, text);
    this.uuid = uuid;
  }

  update(obj: IVTTCue) {
    let changed = false;
    const keys: (keyof IVTTCue)[] = [
      "id",
      "align",
      "line",
      // TODO: NOT SUPPORTED BY CHROME
      // "lineAlign",
      "position",
      // TODO: NOT SUPPORTED BY CHROME
      // "positionAlign",
      "size",
      "snapToLines",
      "vertical",
      "text",
      "endTime",
      "startTime",
    ] as const;

    for (const key of keys) {
      if (this[key] !== obj[key]) {
        // @ts-expect-error
        this[key] = obj[key];
        changed = true;
      }
    }

    if (changed) {
      return true;
    } else {
      return false;
    }
  }
}
