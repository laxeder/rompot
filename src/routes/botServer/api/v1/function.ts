import { Request, Response } from "express";

import { ServerResponse } from "../../../../utils/server";

export default async (req: Request, res: Response) => {
  try {
    const { key, args } = req.body;

    if (!key || !args || !Array.isArray(args)) {
      ServerResponse.send(res, ServerResponse.generate(400, "Invalid request", {}), req["botServer"].options);

      return;
    }

    if (typeof req["botServer"].bot[key] != "function") {
      ServerResponse.send(res, ServerResponse.generate(400, "Key not is function", {}), req["botServer"].options);

      return;
    }

    const value = await req["botServer"].bot[key](...args);

    ServerResponse.send(res, ServerResponse.generate(200, "OK", { value }), req["botServer"].options);
  } catch (error) {
    ServerResponse.send(res, ServerResponse.generateError(error), req["botServer"].options);
  }
};
