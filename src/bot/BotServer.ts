import io from "socket.io-client";
import axios from "axios";

import BotServerRequest, { BotServerRequestAction } from "./BotServerRequest";
import BotServerResponse from "./BotServerResponse";
import BotEvents, { BotEventsMap } from "./BotEvents";
import BotBase from "./BotBase";
import IBot from "./IBot";

export type BotServerConfig<T extends IBot = IBot> = {
  serverId: string;
  url: string;
  port: string;
  bot?: T;
};

export default function BotServer<T extends IBot = IBot>(config: BotServerConfig<T>): T {
  if (!config.bot) {
    config.bot = new BotBase() as any;
  }

  const { bot } = config;

  const sendRequest = async (req: BotServerRequest) => {
    const response = await axios.post(`${config.url}/${config.port}`, req.toJSON());

    return BotServerResponse.fromJSON(response.data || {});
  };

  const socket = io(`${config.url}/${config.port}`);

  socket.on(`emit-${config.serverId}`, async (eventName: keyof BotEventsMap, arg: any) => {
    bot.emit(eventName, arg);
  });

  socket.on(`set-${config.serverId}`, async (key: string, value: any) => {
    if (!bot.hasOwnProperty(key)) return;

    bot[key] = value;
  });

  bot.emit = (eventName: string, arg: any) => {
    const req = new BotServerRequest(BotServerRequestAction.Event, eventName, arg);

    sendRequest(req)
      .then(() => {})
      .catch(() => {});

    return true;
  };

  const eventsKeys = Object.keys(new BotEvents());

  for (const key of Object.keys(bot)) {
    if (typeof bot[key] != "function") continue;
    if (eventsKeys.includes(key)) continue;

    if (typeof bot[key] == "function") {
      bot[key] = async (...args: any[]) => {
        const req = new BotServerRequest(BotServerRequestAction.Function, key, args);

        const response = await axios.post(`${config.url}/${config.port}`, req.toJSON());

        const res = BotServerResponse.fromJSON(response.data || {});

        return res.getData();
      };
    } else {
      let value = bot[key];

      Object.defineProperties(bot[key], {
        valor: {
          get: () => {
            return value;
          },
          set: (v: number) => {
            value = v;
          },
        },
      });
    }
  }

  return bot;
}
