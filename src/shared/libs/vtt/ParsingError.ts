// Creates a new ParserError object from an errorData object. The errorData
// object should have default code and message properties. The default message
// property can be overriden by passing in a message parameter.

import { ExtendableError } from "./ExtendableError";

export class ParsingError extends ExtendableError {
  public static Errors = {
    BadSignature: {
      code: 0,
      message: "Malformed WebVTT signature.",
    },
    BadTimeStamp: {
      code: 1,
      message: "Malformed time stamp.",
    },
  } as const;

  public name = "ParsingError";
  public code: number;
  public message: string;

  constructor(
    errorData: { code: number; message: string },
    messageArg?: string,
  ) {
    const message = messageArg ?? errorData.message;
    super(message);

    this.code = errorData.code;
    this.message = message;
  }
}
