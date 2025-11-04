import React from 'react';
import { TokensList } from 'marked';
import { jsxifyMarkdownToken } from './jsxify-token';

export const tokensJsxRenderer = (tokensArg: TokensList) => {
  return (
    <React.Fragment>
      {tokensArg.map(token => jsxifyMarkdownToken(token))}
    </React.Fragment>
  );
}

