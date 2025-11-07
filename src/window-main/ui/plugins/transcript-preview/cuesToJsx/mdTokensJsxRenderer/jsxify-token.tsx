import React from "react";
import { Token } from "marked";

import { HeadingToken } from "./heading";
import { TextToken } from "./text";
import { SpaceToken } from "./space";
import { ParagraphToken } from "./paragraph";
import { ListToken } from "./list";
import { ListItemToken } from "./list-item";
import { LinkToken } from "./link";
import { AugmentedMdToken } from "../parseHtml";
import { OnScreenCueToken } from "./onscreencue";
import { EmToken } from "./em";
import { BrToken } from "./br";
import { BlockquoteToken } from "./blockquote";
import { StrongToken } from "./strong";

export const jsxifyMarkdownToken = (
  tokenArg: Token,
  options?: { renderOnScreenCuesAsText?: boolean },
) => {
  const token = tokenArg as AugmentedMdToken;
  switch (token.type) {
    case "heading": {
      return <HeadingToken key={Math.random()} {...token} />;
    }
    case "text": {
      return <TextToken key={Math.random()} {...token} />;
    }
    case "space": {
      return <SpaceToken key={Math.random()} {...token} />;
    }
    case "paragraph": {
      return <ParagraphToken key={Math.random()} {...token} />;
    }
    case "list": {
      return <ListToken key={Math.random()} {...token} />;
    }
    case "list_item": {
      return <ListItemToken key={Math.random()} {...token} />;
    }
    case "link": {
      return <LinkToken key={Math.random()} {...token} />;
    }
    case "em": {
      return <EmToken key={Math.random()} {...token} />;
    }
    case "br": {
      return <BrToken key={Math.random()} {...token} />;
    }
    case "blockquote": {
      return <BlockquoteToken key={Math.random()} {...token} />;
    }
    case "strong": {
      return <StrongToken key={Math.random()} {...token} />;
    }
    case "onscreencue": {
      if (options?.renderOnScreenCuesAsText) {
        return <TextToken key={Math.random()} {...token} type="text" />;
      } else {
        return <OnScreenCueToken key={Math.random()} {...token} />;
      }
    }
    default: {
      console.log(token);
      console.log(
        `[jsxifyMarkdownToken]  Token "${token.type}" is not supported`,
      );
    }
  }
};

export const extractTextFromMdToken = (tokenArg: Token) => {
  const token = tokenArg as AugmentedMdToken;
  let text = "";

  if ("tokens" in token) {
    const tokens = token.tokens ?? [];
    for (const childToken of tokens) text += extractTextFromMdToken(childToken);
  } else if ("text" in token) {
    text += token.text;
  }

  return text;
};
