import React from "react";
import { Tokens } from "marked";
import { jsxifyMarkdownToken } from "./jsxify-token";

export const TextToken = (props: Tokens.Text) => {
  if ("tokens" in props) {
    return (
      <React.Fragment>
        {props.tokens?.map((token) => jsxifyMarkdownToken(token))}
      </React.Fragment>
    );
  } else {
    const splitText = props.text.split("\n");
    return splitText.map((text, index, arr) => {
      return (
        <React.Fragment>
          {text}
          {index !== arr.length - 1 ? <br /> : null}
        </React.Fragment>
      );
    });
  }
};
