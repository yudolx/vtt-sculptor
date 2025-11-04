import React from "react";
import type { IOnScreenCueToken } from "../parseHtml";
import { ON_SCREEN_CUE_ANCHOR } from "../const";

export const OnScreenCueToken = (props: IOnScreenCueToken) => {
  return (
    <sup>
      <a href={`#${ON_SCREEN_CUE_ANCHOR}-${props.index}`}>[{props.index}]</a>
    </sup>
  );
};
