import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";
import { Middleware } from "@reduxjs/toolkit";

const sagaMiddleware = createSagaMiddleware();
const middlewares: Middleware[] = [sagaMiddleware, logger];

export { middlewares, sagaMiddleware };
