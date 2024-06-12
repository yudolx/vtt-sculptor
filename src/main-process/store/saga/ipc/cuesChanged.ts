import { PayloadAction } from "@reduxjs/toolkit";
import { IVTTCue } from "shared/libs/vtt/vttcue";

export function* cuesChanged(action: PayloadAction<IVTTCue[]>) {}
