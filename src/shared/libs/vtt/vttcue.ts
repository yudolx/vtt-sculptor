import { IVTTRegion } from "./vttregion";

/**
 * Copyright 2013 vtt.js Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

type AlignSetting = "start" | "middle" | "end" | "left" | "right";

export interface IVTTCue {
  id: string;
  pauseOnExit: boolean;
  startTime: number;
  endTime: number;
  text: string;
  region: IVTTRegion | null;
  vertical: "" | "lr" | "rl";
  snapToLines: boolean;
  line: number | "auto";
  lineAlign: AlignSetting;
  position: string;
  positionAlign: AlignSetting;
  size: number;
  align: AlignSetting;
}

type VttCreateOptions = Partial<IVTTCue> &
  Pick<Required<IVTTCue>, "startTime" | "endTime" | "text">;

export const createVttCue = (overrideWith: VttCreateOptions) => {
  return {
    id: "",
    pauseOnExit: false,
    region: null,
    vertical: "",
    snapToLines: true,
    line: "auto",
    lineAlign: "start",
    position: 50,
    positionAlign: "middle",
    size: 50,
    align: "middle",
    ...overrideWith,
  } as IVTTCue;
};

// const autoKeyword = "auto";
// const directionSetting = {
//   "": true,
//   lr: true,
//   rl: true,
// };
// const alignSetting = {
//   start: true,
//   middle: true,
//   end: true,
//   left: true,
//   right: true,
// };

// function findDirectionSetting(value: keyof typeof directionSetting) {
//   if (typeof value !== "string") {
//     return false;
//   }
//   const dir = directionSetting[value];
//   return dir ? value : false;
// }

// function findAlignSetting(value: keyof typeof alignSetting) {
//   if (typeof value !== "string") {
//     return false;
//   }
//   const align = alignSetting[value];
//   return align ? value : false;
// }

// export class VTTCue {
//   static create(options: VttCreateOptions) {
//     const cue = new VTTCue(options.startTime, options.endTime, options.text);
//     for (const key in options) {
//       if (safeHasOwnProperty(options, key)) {
//         // @ts-expect-error
//         cue[key] = options[key];
//       }
//     }
//     return cue;
//   }

//   static fromJSON(json: string) {
//     return this.create(JSON.parse(json));
//   }

//   // Lets us know when the VTTCue's data has changed in such a way that we need
//   // to recompute its display state. This lets us compute its display state
//   // lazily.
//   protected hasBeenReset = false;

//   // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-video-element.html#text-track-cue-display-state
//   protected displayState = undefined;

//   /**
//    * VTTCue and TextTrackCue properties
//    * http://dev.w3.org/html5/webvtt/#vttcue-interface
//    */
//   protected _id = "";
//   protected _pauseOnExit = false;
//   protected _startTime: number;
//   protected _endTime: number;
//   protected _text: string;
//   protected _region: VTTRegion | null = null;
//   protected _vertical: keyof typeof directionSetting = "";
//   protected _snapToLines = true;
//   protected _line: number | typeof autoKeyword = "auto";
//   protected _lineAlign: keyof typeof alignSetting = "start";
//   protected _position = 50;
//   protected _positionAlign: keyof typeof alignSetting = "middle";
//   protected _size = 50;
//   protected _align: keyof typeof alignSetting = "middle";

//   constructor(startTime: number, endTime: number, text: string) {
//     this._startTime = startTime;
//     this._endTime = endTime;
//     this._text = text;
//   }

//   get id() {
//     return this._id;
//   }
//   set id(value: string) {
//     this.id = value;
//   }

//   get pauseOnExit() {
//     return this._pauseOnExit;
//   }
//   set pauseOnExit(value: boolean) {
//     this._pauseOnExit = value;
//   }

//   get startTime() {
//     return this._startTime;
//   }
//   set startTime(value: number) {
//     this._startTime = value;
//     this.hasBeenReset = true;
//   }

//   get endTime() {
//     return this._endTime;
//   }
//   set endTime(value: number) {
//     this._endTime = value;
//     this.hasBeenReset = true;
//   }

//   get text() {
//     return this._text;
//   }
//   set text(value: string) {
//     this._text = value;
//     this.hasBeenReset = true;
//   }

//   get region() {
//     return this._region;
//   }
//   set region(value: VTTRegion | null) {
//     this._region = value;
//     this.hasBeenReset = true;
//   }

//   get vertical() {
//     return this._vertical;
//   }
//   set vertical(value: keyof typeof directionSetting) {
//     const setting = findDirectionSetting(value);
//     // Have to check for false because the setting an be an empty string.
//     if (setting === false) {
//       throw new SyntaxError("An invalid or illegal string was specified.");
//     }
//     this._vertical = setting;
//     this.hasBeenReset = true;
//   }

//   get snapToLines() {
//     return this._snapToLines;
//   }
//   set snapToLines(value: boolean) {
//     this._snapToLines = value;
//   }

//   get line() {
//     return this._line;
//   }
//   set line(value: number | typeof autoKeyword) {
//     if (typeof value !== "number" && value !== autoKeyword) {
//       throw new SyntaxError(
//         "An invalid number or illegal string was specified.",
//       );
//     }
//     this._line = value;
//     this.hasBeenReset = true;
//   }

//   get lineAlign() {
//     return this._lineAlign;
//   }
//   set lineAlign(value: keyof typeof alignSetting) {
//     const setting = findAlignSetting(value);
//     if (!setting) {
//       throw new SyntaxError("An invalid or illegal string was specified.");
//     }
//     this._lineAlign = setting;
//     this.hasBeenReset = true;
//   }

//   get position() {
//     return this._position;
//   }
//   set position(value: number) {
//     if (value < 0 || value > 100) {
//       throw new Error("Position must be between 0 and 100.");
//     }
//     this._position = value;
//     this.hasBeenReset = true;
//   }

//   get positionAlign() {
//     return this._positionAlign;
//   }
//   set positionAlign(value: keyof typeof alignSetting) {
//     const setting = findAlignSetting(value);
//     if (!setting) {
//       throw new SyntaxError("An invalid or illegal string was specified.");
//     }
//     this._positionAlign = setting;
//     this.hasBeenReset = true;
//   }

//   get size() {
//     return this._size;
//   }
//   set size(value: number) {
//     if (value < 0 || value > 100) {
//       throw new Error("Size must be between 0 and 100.");
//     }
//     this._size = value;
//     this.hasBeenReset = true;
//   }

//   get align() {
//     return this._align;
//   }
//   set align(value: keyof typeof alignSetting) {
//     const setting = findAlignSetting(value);
//     if (!setting) {
//       throw new SyntaxError("An invalid or illegal string was specified.");
//     }
//     this._align = setting;
//     this.hasBeenReset = true;
//   }

//   /**
//    * Extend VTTCue with methods to convert to JSON, from JSON, and construct a
//    * VTTCue from an options object. The primary purpose of this is for use in the
//    * vtt.js test suite (for testing only properties that we care about). It's also
//    * useful if you need to work with VTTCues in JSON format.
//    */
//   toJSON() {
//     const cue = {};
//     // Filter out getCueAsHTML as it's a function and hasBeenReset and displayState as
//     // they're only used when running the processing model algorithm.
//     Object.keys(this).forEach(function (key) {
//       if (
//         key !== "getCueAsHTML" &&
//         key !== "hasBeenReset" &&
//         key !== "displayState"
//       ) {
//         // @ts-expect-error
//         cue[key] = self[key];
//       }
//     });
//     return cue as IVTTCue;
//   }
// }
