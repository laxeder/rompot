import { NextFunction, Request, Response } from "express";

import { BotServer } from "../../../bot/BotServer";

export default (botServer: BotServer) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Object.defineProperty(req, "botServer", {
      get() {
        return botServer;
      },
      set(value) {
        botServer = value;
      },
    });

    return next();
  };
};
