import React from "react";
import { Tokens } from "marked";
import { jsxifyMarkdownToken } from "./jsxify-token";

export const StrongToken = (props: Tokens.Strong) => {
  return (
    <strong>{props.tokens.map((token) => jsxifyMarkdownToken(token))}</strong>
  );
};
