import React from 'react';
import { Tokens } from 'marked';
import { jsxifyMarkdownToken } from './jsxify-token';

export const LinkToken = (props: Tokens.Link) => {
  return (
    <a href={props.href}>{props.tokens.map(token => jsxifyMarkdownToken(token))}</a>
  )
}