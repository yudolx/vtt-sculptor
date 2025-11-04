import React from 'react';
import { Tokens } from 'marked';
import { jsxifyMarkdownToken } from './jsxify-token';

export const ListItemToken = (props: Tokens.ListItem) => {
  return (
    <li>{props.tokens.map(item => jsxifyMarkdownToken(item))}</li>
  )
}