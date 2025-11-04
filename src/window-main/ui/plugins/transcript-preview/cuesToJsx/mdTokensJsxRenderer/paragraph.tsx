import React from 'react';
import { Tokens } from 'marked';
import { jsxifyMarkdownToken } from './jsxify-token';

export const ParagraphToken = (props: Tokens.Paragraph) => {
  return (
    <p>{props.tokens.map(token => jsxifyMarkdownToken(token))}</p>
  )
}