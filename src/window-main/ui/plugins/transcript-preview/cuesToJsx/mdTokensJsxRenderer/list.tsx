import React from 'react';
import { Tokens } from 'marked';
import { jsxifyMarkdownToken } from './jsxify-token';

export const ListToken = (props: Tokens.List) => {
  if (props.ordered) {
    return (
        <ol>{props.items.map(item => jsxifyMarkdownToken(item))}</ol>
    )
  } else {
    return (
        <ul>{props.items.map(item => jsxifyMarkdownToken(item))}</ul>
    )
  }
}