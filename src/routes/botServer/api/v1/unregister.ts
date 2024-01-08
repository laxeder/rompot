import { Request, Response } from "express";

import { ServerResponse } from "../../../../utils/server";

export default (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id) {
      ServerResponse.send(res, ServerResponse.generate(400, "Invalid id", {}), req["botServer"].options);

      return;
    }

    const removed = req["botServer"].removeWebhook(id);

    if (!removed) {
      ServerResponse.send(res, ServerResponse.generate(400, "Webhook not registred", {}), req["botServer"].options);

      return;
    }

    ServerResponse.send(res, ServerResponse.generate(200, "Webhook unregistered successfully", { id }), req["botServer"].options);
  } catch (error) {
    ServerResponse.send(res, ServerResponse.generateError(error), req["botServer"].options);
  }
};
