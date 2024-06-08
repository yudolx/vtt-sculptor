import { createLogger } from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { Middleware } from "@reduxjs/toolkit";

const sagaMiddleware = createSagaMiddleware();
const middlewares: Middleware[] = [
  sagaMiddleware,
  createLogger({
    duration: true,
    level: {
      nextState: false,
      prevState: false,
    },
  }),
];

export { middlewares, sagaMiddleware };
