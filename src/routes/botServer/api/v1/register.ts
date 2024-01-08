import { Request, Response } from "express";

import { ServerResponse } from "../../../../utils/server";
import nonce from "../../../../utils/nonce";

export default (req: Request, res: Response) => {
  try {
    const { url, id } = req.body;

    if (!url) {
      ServerResponse.send(res, ServerResponse.generate(400, "Invalid url", {}), req["botServer"].options);

      return;
    }

    const webhook = { id: id || nonce(), url, ping: 0 };

    req["botServer"].registerWebhook(webhook);

    ServerResponse.send(res, ServerResponse.generate(200, "Webhook registered successfully", webhook), req["botServer"].options);
  } catch (error) {
    ServerResponse.send(res, ServerResponse.generateError(error), req["botServer"].options);
  }
};
