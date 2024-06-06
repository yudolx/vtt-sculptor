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

// import { safeHasOwnProperty } from "shared/safeHasOwnProperty";

// function isValidPercentValue(value: number) {
//   return typeof value === "number" && value >= 0 && value <= 100;
// }

export interface IVTTRegion {
  width: number;
  lines: number;
  regionAnchorY: number;
  regionAnchorX: number;
  viewportAnchorY: number;
  viewportAnchorX: number;
  scroll: "" | "up";
}

export const createVttRegion = (overrideWith: Partial<IVTTRegion>) => {
  return {
    width: 100,
    lines: 3,
    regionAnchorX: 0,
    regionAnchorY: 100,
    viewportAnchorX: 0,
    viewportAnchorY: 100,
    scroll: "",
    ...overrideWith,
  } as IVTTRegion;
};

// export class VTTRegion {
//   static create(options: IVTTRegion) {
//     const region = new VTTRegion();
//     for (const key in options) {
//       if (safeHasOwnProperty(region, key)) {
//         // @ts-expect-error
//         region[key] = options[key];
//       }
//     }
//     return region;
//   }

//   static fromJSON(json: string) {
//     return VTTRegion.create(JSON.parse(json));
//   }

//   protected _width = 100;
//   protected _lines = 3;
//   protected _regionAnchorX = 0;
//   protected _regionAnchorY = 100;
//   protected _viewportAnchorX = 0;
//   protected _viewportAnchorY = 100;
//   protected _scroll: IVTTRegion["scroll"] = "";

//   get width() {
//     return this._width;
//   }
//   set width(value: number) {
//     if (isValidPercentValue(value)) {
//       this._width = value;
//     } else {
//       throw new Error("Width must be between 0 and 100.");
//     }
//   }

//   get lines() {
//     return this._lines;
//   }
//   set lines(value: number) {
//     this._lines = value;
//   }

//   get regionAnchorX() {
//     return this._regionAnchorX;
//   }
//   set regionAnchorX(value: number) {
//     if (isValidPercentValue(value)) {
//       this._regionAnchorX = value;
//     } else {
//       throw new Error("Width must be between 0 and 100.");
//     }
//   }

//   get regionAnchorY() {
//     return this._regionAnchorY;
//   }
//   set regionAnchorY(value: number) {
//     if (isValidPercentValue(value)) {
//       this._regionAnchorY = value;
//     } else {
//       throw new Error("Width must be between 0 and 100.");
//     }
//   }

//   get viewportAnchorX() {
//     return this._viewportAnchorX;
//   }
//   set viewportAnchorX(value: number) {
//     if (isValidPercentValue(value)) {
//       this._viewportAnchorX = value;
//     } else {
//       throw new Error("Width must be between 0 and 100.");
//     }
//   }

//   get viewportAnchorY() {
//     return this._viewportAnchorY;
//   }
//   set viewportAnchorY(value: number) {
//     if (isValidPercentValue(value)) {
//       this._viewportAnchorY = value;
//     } else {
//       throw new Error("Width must be between 0 and 100.");
//     }
//   }

//   get scroll() {
//     return this._scroll;
//   }
//   set scroll(value: IVTTRegion["scroll"]) {
//     this._scroll = value;
//   }
// }
