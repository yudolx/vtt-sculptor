import { ParsingError } from "./ParsingError";
import { Settings } from "./Settings";
import { parseCue, parseOptions } from "./utils";
import { IVTTCue, mockVttCue } from "./vttcue";
import { IVTTRegion, createVttRegion } from "./vttregion";

export enum WebVTTParserState {
  Initial,
  Header,
  Note,
  Id,
  Cue,
  CueText,
  BadCue,
  BadWebVtt,
  Style,
}

type WebVTTCompatibleDecoder = {
  decode(
    input?: AllowSharedBufferSource | string | null,
    options?: {
      stream?: boolean | undefined;
    },
  ): string;
};

export class WebVTTParser {
  protected state: WebVTTParserState = WebVTTParserState.Initial;
  protected buffer: string = "";
  protected decoder: WebVTTCompatibleDecoder;
  protected regionList: {
    id: string;
    region: IVTTRegion;
  }[] = [];
  protected style: string = "";

  protected cue: IVTTCue | null = null;

  public onparsingerror?: (error: ParsingError) => void;
  public oncue?: (cue: IVTTCue) => void;
  public onstyle?: (style: string) => void;
  public onregion?: (regionId: string, cue: IVTTRegion) => void;
  public onflush?: () => void;

  constructor(decoder?: WebVTTCompatibleDecoder) {
    this.decoder = decoder ?? new TextDecoder("utf8");
  }

  // If the error is a ParsingError then report it to the consumer if
  // possible. If it's not a ParsingError then throw it like normal.
  reportOrThrowError(e: any) {
    if (e instanceof ParsingError) {
      this.onparsingerror && this.onparsingerror(e);
    } else {
      throw e;
    }
  }

  parse(data?: string) {
    // If there is no data then we won't decode it, but will just try to parse
    // whatever is in buffer already. This may occur in circumstances, for
    // example when flush() is called.
    if (data) {
      // Try to decode the data that we received.
      this.buffer += this.decoder.decode(data, { stream: true });
    }

    const collectNextLine = () => {
      const buffer = this.buffer;
      let pos = 0;
      while (
        pos < buffer.length &&
        buffer[pos] !== "\r" &&
        buffer[pos] !== "\n"
      ) {
        ++pos;
      }
      const line = buffer.substr(0, pos);
      // Advance the buffer early in case we fail below.
      if (buffer[pos] === "\r") {
        ++pos;
      }
      if (buffer[pos] === "\n") {
        ++pos;
      }
      this.buffer = buffer.substr(pos);
      return line;
    };

    // 3.4 WebVTT region and WebVTT region settings syntax
    const parseRegion = (input: string) => {
      const settings = new Settings();

      parseOptions(
        input,
        (k, v) => {
          switch (k) {
            case "id":
              settings.set(k, v);
              break;
            case "width":
              settings.percent(k, v);
              break;
            case "lines":
              settings.integer(k, v);
              break;
            case "regionanchor":
            case "viewportanchor": {
              const xy = v.split(",");
              if (xy.length !== 2) {
                break;
              }
              // We have to make sure both x and y parse, so use a temporary
              // settings object here.
              const anchor = new Settings();
              anchor.percent("x", xy[0]);
              anchor.percent("y", xy[1]);
              if (!anchor.has("x") || !anchor.has("y")) {
                break;
              }
              settings.set(k + "X", anchor.get("x"));
              settings.set(k + "Y", anchor.get("y"));

              break;
            }
            case "scroll":
              settings.alt(k, v, ["up"] as const);
              break;
          }
        },
        /=/,
        /\s/,
      );

      // Create the region, using default values for any values that were not
      // specified.
      if (settings.has("id")) {
        const region = createVttRegion({
          width: settings.get("width", 100),
          lines: settings.get("lines", 3),
          regionAnchorX: settings.get("regionanchorX", 0),
          regionAnchorY: settings.get("regionanchorY", 100),
          viewportAnchorX: settings.get("viewportanchorX", 0),
          viewportAnchorY: settings.get("viewportanchorY", 100),
          scroll: settings.get("scroll", ""),
        });
        // Register the region.
        this.onregion && this.onregion(settings.get("id"), region);
        // Remember the VTTRegion for later in case we parse any IVTTCues that
        // reference it.
        this.regionList.push({
          id: settings.get("id"),
          region: region,
        });
      }
    };

    // 3.2 WebVTT metadata header syntax
    function parseHeader(input: string) {
      parseOptions(
        input,
        function (k, v) {
          switch (k) {
            case "Region":
              // 3.3 WebVTT region metadata header syntax
              parseRegion(v);
              break;
          }
        },
        /:/,
      );
    }

    // 5.1 WebVTT file parsing.
    try {
      let line;
      if (this.state === WebVTTParserState.Initial) {
        // We can't start parsing until we have the first line.
        if (!/\r\n|\n/.test(this.buffer)) {
          return this;
        }

        line = collectNextLine();

        const m = line.match(/^WEBVTT([ \t].*)?$/);
        if (!m || !m[0]) {
          throw new ParsingError(ParsingError.Errors.BadSignature);
        }

        this.state = WebVTTParserState.Header;
      }

      let alreadyCollectedLine = false;
      while (this.buffer) {
        // We can't parse a line until we have the full line.
        if (!/\r\n|\n/.test(this.buffer)) {
          return this;
        }

        if (!alreadyCollectedLine) {
          line = collectNextLine();
        } else {
          alreadyCollectedLine = false;
        }

        switch (this.state) {
          case WebVTTParserState.Header:
            // 13-18 - Allow a header (metadata) under the WEBVTT line.
            if (/:/.test(line!)) {
              parseHeader(line!);
            } else if (!line) {
              // An empty line terminates the header and starts the body (cues).
              this.state = WebVTTParserState.Id;
            }
            continue;
          case WebVTTParserState.Note:
            // Ignore NOTE blocks.
            if (!line) {
              this.state = WebVTTParserState.Id;
            }
            continue;
          case WebVTTParserState.Style:
            if (!line) {
              this.state = WebVTTParserState.Id;

              if (this.style.length > 0) {
                this.onstyle?.(this.style);
                this.style = "";
              }

              break;
            }

            if (line.indexOf("-->") !== -1) {
              throw new ParsingError(ParsingError.Errors.BadStyle);
            }

            if (this.style.length) {
              this.style += "\n";
            }
            this.style += line;
            break;
          case WebVTTParserState.Id:
            // Check for the start of NOTE blocks.
            if (/^NOTE($|[ \t])/.test(line!)) {
              this.state = WebVTTParserState.Note;
              break;
            }
            // Check for the start of STYLE blocks.
            if (/^STYLE($|[ \t])/.test(line!)) {
              this.state = WebVTTParserState.Style;
              break;
            }
            // 19-29 - Allow any number of line terminators, then initialize new cue values.
            if (!line) {
              continue;
            }
            this.cue = mockVttCue({
              startTime: 0,
              endTime: 0,
              text: "",
            });
            this.state = WebVTTParserState.Cue;
            // 30-39 - Check if self line contains an optional identifier or timing data.
            if (line.indexOf("-->") === -1) {
              this.cue.id = line;
              continue;
            }
          // Process line as start of a cue.
          /*falls through*/
          case WebVTTParserState.Cue:
            // 40 - Collect cue timings and settings.
            try {
              parseCue(line!, this.cue!, this.regionList);
            } catch (e) {
              this.reportOrThrowError(e);
              // In case of an error ignore rest of the cue.
              this.cue = null;
              this.state = WebVTTParserState.BadCue;
              continue;
            }
            this.state = WebVTTParserState.CueText;
            continue;
          case WebVTTParserState.CueText: {
            const hasSubstring = line!.indexOf("-->") !== -1;
            // 34 - If we have an empty line then report the cue.
            // 35 - If we have the special substring '-->' then report the cue,
            // but do not collect the line as we need to process the current
            // one as a new cue.
            if (!line || (hasSubstring && (alreadyCollectedLine = true))) {
              // We are done parsing self cue.
              this.oncue && this.oncue(this.cue!);
              this.cue = null;
              this.state = WebVTTParserState.Id;
              continue;
            }
            if (this.cue?.text) {
              this.cue.text += "\n";
            }
            this.cue!.text += line;
            continue;
          }
          case WebVTTParserState.BadCue: // BADCUE
            // 54-62 - Collect and discard the remaining cue.
            if (!line) {
              this.state = WebVTTParserState.Id;
            }
            continue;
        }
      }
    } catch (e) {
      console.log(e);
      this.reportOrThrowError(e);

      // If we are currently parsing a cue, report what we have.
      if (this.state === WebVTTParserState.CueText && this.cue && this.oncue) {
        this.oncue(this.cue);
      }
      this.cue = null;
      // Enter BADWEBVTT state if header was not parsed correctly otherwise
      // another exception occurred so enter BADCUE state.
      this.state =
        this.state === WebVTTParserState.Initial
          ? WebVTTParserState.BadWebVtt
          : WebVTTParserState.BadCue;
    }
    return this;
  }

  flush() {
    try {
      // Finish decoding the stream.
      this.buffer += this.decoder.decode();
      // Synthesize the end of the current cue or region.
      if (this.cue || this.state === WebVTTParserState.Header) {
        this.buffer += "\n\n";
        this.parse();
      }
      // If we've flushed, parsed, and we're still on the INITIAL state then
      // that means we don't have enough of the stream to parse the first
      // line.
      if (this.state === WebVTTParserState.Initial) {
        throw new ParsingError(ParsingError.Errors.BadSignature);
      }
    } catch (e) {
      this.reportOrThrowError(e);
    }
    this.onflush && this.onflush();
    return this;
  }
}
