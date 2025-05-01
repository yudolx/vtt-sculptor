import { getEntries } from "shared/getEntries";
import { IVTTCue, mockVttCue } from "./vttcue";
import { IVTTRegion } from "./vttregion";

const stringifyStyle = (style: string) => {
  return `STYLE\n${style}\n`;
};

const stringifyRegions = (regionId: string, region: IVTTRegion) => {
  return `Region: id=${regionId} width=${region.width}% lines=${region.lines} regionanchor=${region.regionAnchorX}%,${region.regionAnchorY}% viewportanchor=${region.viewportAnchorX}%,${region.viewportAnchorY}% scroll=${region.scroll}\n`;
};

export const stringifyTimestamp = (timestampArg: number) => {
  let timestamp = timestampArg;
  let hours: number, minutes: number, seconds: number, mseconds: number;

  /* eslint-disable prettier/prettier */
  timestamp -= (hours = Math.floor(Math.trunc(timestamp / 60 / 60)), hours * 60 * 60);
  timestamp -= (minutes = Math.floor(Math.trunc(timestamp / 60)), minutes * 60);
  timestamp -= seconds = Math.floor(timestamp);
  mseconds = Math.floor(timestamp * 1000);
  /* eslint-enable prettier/prettier */

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${mseconds.toString().padStart(3, "0")}`;
};

const stringifyCue = (cue: IVTTCue) => {
  const notNull = <T>(data: T | null): data is Exclude<T, null> =>
    data !== null;

  const defaultCue = mockVttCue({ endTime: 0, startTime: 0, text: "" });

  const cueSettings = [
    cue.region !== defaultCue.region ? `region:${cue.region}` : null,
    cue.vertical !== defaultCue.vertical ? `vertical:${cue.vertical}` : null,
    cue.line !== defaultCue.line
      ? `line:${typeof cue.line === "number" ? `${cue.line}${cue.snapToLines === false ? "%" : ""}` : cue.line}`
      : null,
    cue.position !== defaultCue.position
      ? `position:${typeof cue.position === "number" ? `${cue.position}%` : cue.position}`
      : null,
    cue.size !== defaultCue.size ? `size:${cue.size}%` : null,
    cue.align !== defaultCue.align ? `align:${cue.align}` : null,
  ].filter(notNull);

  return [
    cue.id,
    `${stringifyTimestamp(cue.startTime)} --> ${stringifyTimestamp(cue.endTime)} ${cueSettings.join(" ")}`,
    cue.text,
  ]
    .join("\n")
    .trim();
};

export const stringifyVTT = (
  cues: IVTTCue[],
  regions: Record<string, IVTTRegion>,
  styles: string[],
) => {
  return [
    "WEBVTT\n",

    styles.map(stringifyStyle).join("\n"),

    getEntries(regions)
      .map(([regionId, region]) => stringifyRegions(regionId, region))
      .join("\n"),

    cues.map(stringifyCue).join("\n\n"),
  ]
    .filter((s) => s !== "")
    .join("\n");
};
