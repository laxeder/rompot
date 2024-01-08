import { Request, Response } from "express";

import { ServerResponse } from "../../../../utils/server";

export default (req: Request, res: Response) => {
  try {
    ServerResponse.send(res, ServerResponse.generate(200, `PING ${new Date().toISOString()}`, {}), req["botServer"].options);
  } catch (error) {
    ServerResponse.send(res, ServerResponse.generateError(error), req["botServer"].options);
  }
};
