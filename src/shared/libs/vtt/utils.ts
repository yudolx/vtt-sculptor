import { ParsingError } from "./ParsingError";
import { Settings } from "./Settings";
import { IVTTCue } from "./vttcue";
import { IVTTRegion } from "./vttregion";

// Try to parse input as a time stamp.
export function parseTimeStamp(input: string) {
  function computeSeconds(
    h: string | number,
    m: string | number,
    s: string | number,
    f: string | number,
  ) {
    // @ts-expect-error
    return (h | 0) * 3600 + (m | 0) * 60 + (s | 0) + (f | 0) / 1000;
  }

  const m = input.match(/^(\d+):(\d{2})(:\d{2})?\.(\d{3})/);
  if (!m) {
    return null;
  }

  if (m[3]) {
    // Timestamp takes the form of [hours]:[minutes]:[seconds].[milliseconds]
    return computeSeconds(m[1], m[2], m[3].replace(":", ""), m[4]);
  } else if (
    // @ts-expect-error
    m[1] > 59
  ) {
    // Timestamp takes the form of [hours]:[minutes].[milliseconds]
    // First position is hours as it's over 59.
    return computeSeconds(m[1], m[2], 0, m[4]);
  } else {
    // Timestamp takes the form of [minutes]:[seconds].[milliseconds]
    return computeSeconds(0, m[1], m[2], m[4]);
  }
}

// Helper function to parse input into groups separated by 'groupDelim', and
// interprete each group as a key/value pair separated by 'keyValueDelim'.
export function parseOptions(
  input: string,
  callback: (key: string, value: string) => void,
  keyValueDelim: string | RegExp,
  groupDelim?: string | RegExp,
) {
  const groups = groupDelim ? input.split(groupDelim) : [input];
  for (const i in groups) {
    if (typeof groups[i] !== "string") {
      continue;
    }
    const kv = groups[i].split(keyValueDelim);
    if (kv.length !== 2) {
      continue;
    }
    const k = kv[0];
    const v = kv[1];
    callback(k, v);
  }
}

// Helper to allow strings to be decoded instead of the default binary utf8 data.
export const StringDecoder = function () {
  return {
    decode: function (data: string) {
      if (!data) {
        return "";
      }
      if (typeof data !== "string") {
        throw new Error("Error - expected string data.");
      }
      return decodeURIComponent(encodeURIComponent(data));
    },
  };
};

export function parseCue(
  input: string,
  cue: IVTTCue,
  regionList: { id: string; region: IVTTRegion }[],
) {
  // Remember the original input if we need to throw an error.
  const oInput = input;
  // 4.1 WebVTT timestamp
  function consumeTimeStamp() {
    const ts = parseTimeStamp(input);
    if (ts === null) {
      throw new ParsingError(
        ParsingError.Errors.BadTimeStamp,
        "Malformed timestamp: " + oInput,
      );
    }
    // Remove time stamp from input.
    input = input.replace(/^[^\sa-zA-Z-]+/, "");
    return ts;
  }

  // 4.4.2 WebVTT cue settings
  function consumeCueSettings(input: string, cue: IVTTCue) {
    const settings = new Settings();

    parseOptions(
      input,
      function (k, v) {
        switch (k) {
          case "region":
            // Find the last region we parsed with the same region id.
            for (let i = regionList.length - 1; i >= 0; i--) {
              if (regionList[i].id === v) {
                settings.set(k, regionList[i].region);
                break;
              }
            }
            break;
          case "vertical":
            settings.alt(k, v, ["rl", "lr"]);
            break;
          case "line": {
            const vals = v.split(",");
            const vals0 = vals[0];
            settings.integer(k, vals0);
            settings.percent(k, vals0)
              ? settings.set("snapToLines", false)
              : null;
            settings.alt(k, vals0, ["auto"]);
            if (vals.length === 2) {
              settings.alt("lineAlign", vals[1], ["start", "middle", "end"]);
            }
            break;
          }
          case "position": {
            const vals = v.split(",");
            settings.percent(k, vals[0]);
            if (vals.length === 2) {
              settings.alt("positionAlign", vals[1], [
                "start",
                "middle",
                "end",
              ]);
            }
            break;
          }
          case "size":
            settings.percent(k, v);
            break;
          case "align":
            settings.alt(k, v, ["start", "middle", "end", "left", "right"]);
            break;
        }
      },
      /:/,
      /\s/,
    );

    // Apply default values for any missing fields.
    cue.region = settings.get("region", null);
    cue.vertical = settings.get("vertical", "");
    cue.line = settings.get("line", "auto");
    cue.lineAlign = settings.get("lineAlign", "start");
    cue.snapToLines = settings.get("snapToLines", true);
    cue.size = settings.get("size", 100);
    cue.align = settings.get("align", "middle");
    cue.position = settings.get("position", "auto");
    cue.positionAlign = settings.get(
      "positionAlign",
      {
        start: "start",
        left: "start",
        middle: "middle",
        end: "end",
        right: "end",
      },
      cue.align,
    );
  }

  function skipWhitespace() {
    input = input.replace(/^\s+/, "");
  }

  // 4.1 WebVTT cue timings.
  skipWhitespace();
  cue.startTime = consumeTimeStamp(); // (1) collect cue start time
  skipWhitespace();
  if (input.substr(0, 3) !== "-->") {
    // (3) next characters must match "-->"
    throw new ParsingError(
      ParsingError.Errors.BadTimeStamp,
      "Malformed time stamp (time stamps must be separated by '-->'): " +
        oInput,
    );
  }
  input = input.substr(3);
  skipWhitespace();
  cue.endTime = consumeTimeStamp(); // (5) collect cue end time

  // 4.1 WebVTT cue settings list.
  skipWhitespace();
  consumeCueSettings(input, cue);
}
