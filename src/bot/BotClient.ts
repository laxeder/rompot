import { Server, createServer } from "http";
import pino, { Logger } from "pino";
import { join } from "path";
import axios from "axios";

import { BotEventsMap } from "./BotEvents";
import { BotWebhook } from "./BotWebhook";
import IBot from "./IBot";

import { ServerRequest } from "../utils/server";
import nonce from "../utils/nonce";

export type BotClientOptions = {
  serverId: string;
  serverHost: string;
  serverPort: number;
  host: string;
  port: number;
  server: Server;
  logger: Logger;
  version: "apiV1";
  webhook: BotWebhook;
};

export interface BotClientBase {
  options: BotClientOptions;
  registerWebhook(webhook: BotWebhook): Promise<string>;
  removeWebhook(id: string): Promise<void>;
}

export type BotClient<Bot extends IBot = IBot> = Bot & BotClientBase;

export default function BotClient<Bot extends IBot = IBot>(bot: Bot, options: Partial<BotClientOptions> = {}): BotClient<Bot> {
  if (!bot || typeof bot !== "object") {
    throw new Error("Invalid bot");
  }

  const botClient: BotClient<Bot> = { ...bot, ...generateBotClientBase(options) };

  const prototypes: any[] = [Object.getPrototypeOf(bot)];

  while (prototypes[prototypes.length - 1]) {
    prototypes.push(Object.getPrototypeOf(prototypes[prototypes.length - 1]));
  }

  for (let i: number = 0; i < prototypes.length - 2; i++) {
    for (const name of Object.getOwnPropertyNames(prototypes[i])) {
      if (name.startsWith("_")) continue;
      if (name == "constructor") continue;

      Object.defineProperty(botClient, name, {
        get: () => {
          if (typeof bot[name] == "function") {
            return async (...args: any[]) => {
              const { data } = await ServerRequest.send<{ value: any }>(getBotClientServerUrl(botClient.options), ServerRequest.generate(ServerRequest.RequestMethod.POST, name, ...args));

              return data.value;
            };
          } else {
            return bot[name];
          }
        },
        set: (value) => {
          if (typeof bot[name] == "function") {
            bot[name] = value;
          } else {
            ServerRequest.send(getBotClientServerUrl(botClient.options), ServerRequest.generate(ServerRequest.RequestMethod.SET, name, value));
          }
        },
      });
    }
  }

  const emit = <T extends keyof BotEventsMap>(eventName: T, arg: BotEventsMap[T]): boolean => {
    try {
      ServerRequest.send(getBotClientServerUrl(botClient.options, "register"), ServerRequest.generate(ServerRequest.RequestMethod.EMIT, eventName, arg));

      return true;
    } catch (error) {
      bot.ev.emit(eventName, arg);

      return false;
    }
  };

  bot.emit = emit;
  botClient.emit = emit;

  botClient.registerWebhook(botClient.options.webhook);

  return botClient;
}

export function generateBotClientBase(partialOptions: Partial<BotClientOptions> = {}): BotClientBase {
  const options: BotClientOptions = generateBotClientOptions(partialOptions);

  return {
    options,

    async registerWebhook(webhook: BotWebhook): Promise<string> {
      const { data } = await axios.post(getBotClientServerUrl(options, "register"), webhook);

      return data.id;
    },

    async removeWebhook(id: string): Promise<void> {
      await axios.post(getBotClientServerUrl(options, "unregister"), { id });
    },
  };
}

export function generateBotClientOptions(options: Partial<BotClientOptions>): BotClientOptions {
  const host = options.host || "http://localhost";
  const port = options.port || 8061;

  const botServerOptions: BotClientOptions = {
    serverId: options.serverId || nonce(),
    host,
    port,
    server: options.server || createServer(),
    serverHost: options.serverHost || host,
    serverPort: options.serverPort || 8060,
    logger: options.logger || pino(),
    version: "apiV1",
    webhook: { id: nonce(), url: `${host}:${port}`, ping: 0 },
  };

  return botServerOptions;
}

export function getBotClientServerUrl(options: BotClientOptions, ...paths: string[]): string {
  return join(`${options.serverHost}:${options.serverPort}/${options.serverId}/api/v1`, ...paths);
}
