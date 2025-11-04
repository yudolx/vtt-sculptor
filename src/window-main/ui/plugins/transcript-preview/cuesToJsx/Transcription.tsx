import React from "react";
import { jsxifyMarkdownToken } from "./mdTokensJsxRenderer/jsxify-token";
import { AugmentedMdToken, IOnScreenCueToken } from "./parseHtml";
import { ON_SCREEN_CUE_ANCHOR } from "./const";

export interface ITranscriptionProps {
  tokens: AugmentedMdToken[];
}

const findOnScreenTokens = (tokens: AugmentedMdToken[]) => {
  const result: IOnScreenCueToken[] = [];

  for (const token of tokens) {
    if (token.type === "onscreencue") {
      result.push(token);
    } else if ("tokens" in token) {
      result.push(...findOnScreenTokens(token.tokens as AugmentedMdToken[]));
    }
  }

  return result;
};

export const Transcription: React.FC<ITranscriptionProps> = (props) => {
  const onScreenCueTokens = findOnScreenTokens(props.tokens);

  const hasRegularCues = !!props.tokens.find(
    (token) => token.type !== "onscreencue",
  );

  const renderOnScreenCuesList = (tokens = onScreenCueTokens) => {
    if (tokens.length < 1) {
      return null;
    }

    return (
      <React.Fragment>
        <hr style={{ margin: "10px 0" }} />
        <ol>
          {tokens.map((cue) => {
            const id = `${ON_SCREEN_CUE_ANCHOR}-${cue.index}`;
            return (
              <li key={id} id={id}>
                {jsxifyMarkdownToken(cue, { renderOnScreenCuesAsText: true })}
              </li>
            );
          })}
        </ol>
      </React.Fragment>
    );
  };

  return (
    <div>
      {!hasRegularCues ? (
        props.tokens.map((token) =>
          jsxifyMarkdownToken(token, { renderOnScreenCuesAsText: true }),
        )
      ) : (
        <React.Fragment>
          {props.tokens.map((token) => jsxifyMarkdownToken(token))}
          {renderOnScreenCuesList()}
        </React.Fragment>
      )}
    </div>
  );
};
