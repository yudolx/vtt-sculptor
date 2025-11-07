import React from "react";
import { Tokens } from "marked";
import { jsxifyMarkdownToken } from "./jsxify-token";

export const EmToken = (props: Tokens.Em) => {
  return <em>{props.tokens.map((token) => jsxifyMarkdownToken(token))}</em>;
};
