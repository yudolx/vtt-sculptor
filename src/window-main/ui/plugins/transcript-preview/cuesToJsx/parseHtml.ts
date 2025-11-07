import { MarkedToken, Token, Tokens } from "marked";
import { DomHandler, ChildNode, isTag, isText } from "domhandler";
import renderDomHandler from "dom-serializer";
import { ElementType, Parser } from "htmlparser2";
import { IVTTCue } from "shared/libs/vtt/vttcue";
import { ON_SCREEN_CUE_ID } from "./const";
import { deepClone } from "shared/deepClone";

export interface IOnScreenCueToken {
  type: "onscreencue";
  index: number;
  raw: string;
  text: string;
  tokens?: Token[];
  escaped?: boolean;
}
export type AugmentedMdToken = MarkedToken | IOnScreenCueToken;

export const cuesToMdTokens = async (cuesArg: IVTTCue[]) => {
  let cues = deepClone(cuesArg);

  const isOnScreenCueId = (id: string) => {
    return id === ON_SCREEN_CUE_ID || id.startsWith(`${ON_SCREEN_CUE_ID}::`);
  };

  const getConfigFromCueId = (id: string) => {
    if (isOnScreenCueId(id)) {
      const [, config = ""] = id.split("::");
      const parsedConfig = config.split(",");
      return parsedConfig;
    } else {
      return null;
    }
  };

  // Clamp on screen cues
  let prevOnScreenCueIndex: number | null = null;
  cues = cues.filter((cue, index, array) => {
    if (isOnScreenCueId(cue.id)) {
      const cueConfig = getConfigFromCueId(cue.id);
      if (cueConfig?.includes("CLAMP_TOP") && prevOnScreenCueIndex !== null) {
        const prevOnScreenCue = array[prevOnScreenCueIndex];
        prevOnScreenCue.text += cue.text;

        return false;
      } else {
        prevOnScreenCueIndex = index;
      }
    }

    return true;
  });

  let onScreenCueCounter = 1;
  const text = cues
    .map((cue, index, cues) => {
      const prevCue = cues.at(index - 1);
      const nextCue = cues.at(index + 1);

      const cueText = `${isOnScreenCueId(prevCue?.id ?? "") ? " " : ""}${cue.text}${isOnScreenCueId(nextCue?.id ?? "") ? " " : ""}`;

      if (isOnScreenCueId(cue.id)) {
        return `<onscreencue attr-index="${onScreenCueCounter++}">${cueText}</onscreencue>`;
      } else {
        return cueText;
      }
    })
    .join("");

  return new Promise<AugmentedMdToken[]>((resolve, reject) => {
    const handler = new DomHandler((error, dom) => {
      if (error) {
        reject(error);
      } else {
        resolve(domToMdTokensInterface(dom));
      }
    });

    const parser = new Parser(handler);
    parser.write(text);
    parser.end();
  });
};

const domToMdTokensInterface = (dom: ChildNode[]): AugmentedMdToken[] => {
  const mdtokens: AugmentedMdToken[] = [];

  for (const domToken of dom) {
    if (domToken.type === ElementType.Tag) {
      if (domToken.tagName == "p") {
        mdtokens.push({
          type: "paragraph",
          raw: renderDomHandler(domToken),
          pre: false,
          text: extractAllTextNodesAsText(domToken.childNodes),
          tokens: domToMdTokensInterface(domToken.childNodes),
        });
      } else if (domToken.tagName === "br") {
        mdtokens.push({
          type: "br",
          raw: renderDomHandler(domToken),
        });
      } else if (domToken.tagName === "em" || domToken.tagName === "i") {
        mdtokens.push({
          type: "em",
          raw: renderDomHandler(domToken),
          text: extractAllTextNodesAsText(domToken.childNodes),
          tokens: domToMdTokensInterface(domToken.childNodes),
        });
      } else if (domToken.tagName === "ol" || domToken.tagName === "ul") {
        mdtokens.push({
          type: "list",
          raw: renderDomHandler(domToken),
          ordered: domToken.tagName === "ol",
          start: domToken.tagName === "ol" ? 1 : "",
          loose: false,
          items: domToMdTokensInterface(
            domToken.childNodes,
          ) as Tokens.ListItem[],
        });
      } else if (domToken.tagName === "li") {
        mdtokens.push({
          type: "list_item",
          raw: renderDomHandler(domToken),
          task: false,
          checked: undefined,
          loose: false,
          text: extractAllTextNodesAsText(domToken.childNodes),
          tokens: domToMdTokensInterface(domToken.childNodes),
        });
      } else if (domToken.tagName === "blockquote") {
        mdtokens.push({
          type: "blockquote",
          raw: renderDomHandler(domToken),
          text: extractAllTextNodesAsText(domToken.childNodes),
          tokens: domToMdTokensInterface(domToken.childNodes),
        });
      } else if (domToken.tagName === "onscreencue") {
        mdtokens.push({
          type: "onscreencue",
          index: parseFloat(domToken.attribs["attr-index"]),
          raw: renderDomHandler(domToken),
          text: extractAllTextNodesAsText(domToken.childNodes),
          tokens: domToMdTokensInterface(domToken.childNodes),
        });
      } else if (domToken.tagName === "strong" || domToken.tagName === "b") {
        mdtokens.push({
          type: "strong",
          raw: renderDomHandler(domToken),
          text: extractAllTextNodesAsText(domToken.childNodes),
          tokens: domToMdTokensInterface(domToken.childNodes),
        });
      } else if (domToken.tagName === "hft") {
        // hft stands for "hide ftom transcript". Custom tag. This tag will be ignored by
        // the built-in browser subtitles renderer, so it will be visilble on
        // the video subtitles but not in the transcription section
        // DO NOTHING
      } else {
        console.log(
          `[domhandlerToMdTokensInterface] Element tag <${domToken.tagName}> is not supported`,
        );
        mdtokens.push({
          type: "text",
          raw: renderDomHandler(domToken),
          text: extractAllTextNodesAsText(domToken.childNodes),
        });
      }
    } else if (domToken.type === ElementType.Text) {
      mdtokens.push({
        type: "text",
        raw: domToken.nodeValue,
        text: domToken.nodeValue,
      });
    } else {
      console.log(
        `[domhandlerToMdTokensInterface] Token type ${domToken.type} is not supported.`,
      );
    }
  }

  return mdtokens;
};

export const extractAllTextNodesAsText = (dom: ChildNode[]) => {
  let text = "";
  for (const node of dom) {
    if (isTag(node)) {
      text += extractAllTextNodesAsText(node.childNodes);
    } else if (isText(node)) {
      text += node.nodeValue;
    }
  }

  return text;
};
