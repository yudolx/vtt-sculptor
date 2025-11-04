import React from 'react';
import { Tokens } from 'marked';
import { jsxifyMarkdownToken } from './jsxify-token';

export const BlockquoteToken = (props: Tokens.Blockquote) => {
  return (
    <blockquote>{props.tokens.map(token => jsxifyMarkdownToken(token))}</blockquote>
  )
}