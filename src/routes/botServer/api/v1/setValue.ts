import { Request, Response } from "express";

import { ServerResponse } from "../../../../utils/server";

export default (req: Request, res: Response) => {
  try {
    const { key, args } = req.body;

    if (!key || !args || !Array.isArray(args) || args.length == 0) {
      ServerResponse.send(res, ServerResponse.generate(400, "Invalid request", {}), req["botServer"].options);

      return;
    }

    req["botServer"].bot[key] = args[0];

    ServerResponse.send(res, ServerResponse.generate(200, "OK", {}), req["botServer"].options);
  } catch (error) {
    ServerResponse.send(res, ServerResponse.generateError(error), req["botServer"].options);
  }
};
