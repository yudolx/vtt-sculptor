import React from 'react';
import { Tokens } from 'marked';
import { jsxifyMarkdownToken } from './jsxify-token';

const depthMap = new Map([
  [1, <h1 />],
  [2, <h2 />],
  [3, <h3 />],
  [4, <h4 />],
  [5, <h5 />],
  [6, <h6 />],
]);

export const HeadingToken = (props: Tokens.Heading) => {
  const Tag = depthMap.get(props.depth);
  const id = props.text.toLowerCase().replace(/[^\w]+/g, '-')

  if (!Tag) {
    console.log(`[HeadingToken] Unsupported depth - ${props.depth}`);
    return null;
  }

  return (
    React.cloneElement(Tag, { id }, ...(props.tokens.map(token => jsxifyMarkdownToken(token))))
  )
}