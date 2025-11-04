import React from 'react';
import { Tokens } from 'marked';

export const SpaceToken = (props: Tokens.Space) => {
  return null;
  // return <React.Fragment>
  //   {props.raw.split(/\n/).map((s) => {
  //     if (!s.length) {
  //       return <br />;
  //     } else {
  //       return s;
  //     }
  //   })}
  // </React.Fragment>;
}