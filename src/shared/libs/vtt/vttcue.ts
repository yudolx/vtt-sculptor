import { IVTTRegion } from "./vttregion";
import { randomUUID } from "crypto";

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

export interface IVTTCue {
  uuid: string;
  id: string;
  pauseOnExit: boolean;
  startTime: number;
  endTime: number;
  text: string;
  region: string | null;
  vertical: DirectionSetting;
  snapToLines: boolean;
  line: LineAndPositionSetting;
  lineAlign: LineAlignSetting;
  position: LineAndPositionSetting;
  positionAlign: PositionAlignSetting;
  size: number;
  align: AlignSetting;
}

type VttCreateOptions = Partial<IVTTCue> &
  Pick<Required<IVTTCue>, "startTime" | "endTime" | "text">;

export const createVttCue = (overrideWith: VttCreateOptions): IVTTCue => {
  return {
    uuid: randomUUID(),
    id: "",
    pauseOnExit: false,
    region: null,
    vertical: "",
    snapToLines: true,
    line: "auto",
    lineAlign: "start",
    position: 50,
    positionAlign: "center",
    size: 50,
    align: "center",
    ...overrideWith,
  };
};
