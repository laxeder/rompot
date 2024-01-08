import { Router } from "express";

import { BotServer } from "../../bot/BotServer";

import setBotServer from "./middlewares/setBotServer";

import ping from "./api/v1/ping";
import emitEvent from "./api/v1/emitEvent";
import setValue from "./api/v1/setValue";
import _function from "./api/v1/function";
import register from "./api/v1/register";
import unregister from "./api/v1/unregister";

export enum RouterMethod {
  PATCH = "patch",
  POST = "post",
  GET = "get",
}

export function apiV1(botServer: BotServer): Router {
  const routes = Router();
  const baseUrl = `/api/v1`;

  routes.get(`${baseUrl}/ping`, setBotServer(botServer), ping);
  routes.patch(`${baseUrl}/emitEvent`, setBotServer(botServer), emitEvent);
  routes.patch(`${baseUrl}/setValue`, setBotServer(botServer), setValue);
  routes.patch(`${baseUrl}/function`, setBotServer(botServer), _function);
  routes.post(`${baseUrl}/register`, setBotServer(botServer), register);
  routes.post(`${baseUrl}/unregister`, setBotServer(botServer), unregister);

  return routes;
}
