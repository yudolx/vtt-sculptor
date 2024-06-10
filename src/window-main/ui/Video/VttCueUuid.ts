export class VTTCueUuid extends VTTCue {
  static is(data: unknown): data is VTTCueUuid {
    return data instanceof VTTCueUuid;
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
}
