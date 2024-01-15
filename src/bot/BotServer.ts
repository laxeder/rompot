import { Server, createServer } from "http";
import express, { Express } from "express";
import bodyParser from "body-parser";
import pino, { Logger } from "pino";

import { BotEventsMap } from "./BotEvents";
import IBot from "./IBot";

import { apiV1 } from "../routes/botServer/routes";

import { ServerRequest, ServerResponse } from "../utils/server";
import nonce from "../utils/nonce";

export type BotServerOptions = {
  serverId: string;
  server: Server;
  port: number;
  disableAutoStart?: boolean;
  pingInterval: number;
  maxPing: number;
  logger: Logger;
  version: "apiV1";
};

export type BotWebhook = {
  id: string;
  url: string;
  ping: number;
};

export interface BotServerBase {
  options: BotServerOptions;
  webhooks: Record<string, BotWebhook>;
  sendAll(body: ServerRequest.Body): Promise<void>;
  pingWebhook(id: string): Promise<boolean>;
  registerWebhook(webhook: BotWebhook): void;
  removeWebhook(id: string): boolean;
}

export type BotServer<Bot extends IBot = IBot> = Bot & BotServerBase;

export default function BotServer<Bot extends IBot = IBot>(bot: Bot, options: Partial<BotServerOptions> = {}): BotServer<Bot> {
  if (!bot || typeof bot !== "object") {
    throw new Error("Invalid bot");
  }

  const botServer: BotServer<Bot> = { ...bot, ...generateBotServerBase(options) };

  const prototypes: any[] = [Object.getPrototypeOf(bot)];

  while (prototypes[prototypes.length - 1]) {
    prototypes.push(Object.getPrototypeOf(prototypes[prototypes.length - 1]));
  }

  for (let i: number = 0; i < prototypes.length - 2; i++) {
    for (const name of Object.getOwnPropertyNames(prototypes[i])) {
      if (name.startsWith("_")) continue;
      if (name == "constructor") continue;

      Object.defineProperty(botServer, name, {
        get: () => {
          if (typeof bot[name] == "function") {
            return bot[name].bind(bot);
          } else {
            return bot[name];
          }
        },
        set: (value) => {
          bot[name] = value;
        },
      });
    }
  }

  const app: Express = express();

  app.use(bodyParser.json({ limit: Infinity }));
  app.use(bodyParser.urlencoded({ extended: true }));

  if (botServer.options.version == "apiV1") {
    app.use(`/${botServer.options.serverId}`, apiV1(botServer));
  } else {
    app.use(`/${botServer.options.serverId}`, apiV1(botServer));
  }

  botServer.options.server.on("request", app);

  if (!options.disableAutoStart) {
    botServer.options.server.listen(options.port, () => {
      botServer.options.logger.info(`Bot Server "${botServer.options.serverId}" is running on port ${botServer.options.port}`);
    });
  }

  const emit = <T extends keyof BotEventsMap>(eventName: T, arg: BotEventsMap[T]): boolean => {
    botServer.sendAll(ServerRequest.generate(ServerRequest.RequestMethod.EMIT, eventName, arg));

    return bot.ev.emit(eventName, arg);
  };

  bot.emit = emit;
  botServer.emit = emit;

  return botServer;
}

export function generateBotServerBase(partialOptions: Partial<BotServerOptions> = {}): BotServerBase {
  const options: BotServerOptions = generateBotServerOptions(partialOptions);
  const webhooks: Record<string, BotWebhook> = {};

  return {
    options,
    webhooks,

    async sendAll(body: ServerRequest.Body) {
      await Promise.all(
        Object.values(this.webhooks).map(async (webhook) => {
          try {
            const exists = await this.pingWebhook(webhook.id);

            if (!exists) return;

            await ServerRequest.send(webhook.url, body);
          } catch (error) {
            this.options.logger.error(JSON.stringify(ServerResponse.generateError(error), undefined, 2));
          }
        })
      );
    },

    async pingWebhook(id: string): Promise<boolean> {
      try {
        await new Promise((res) => setTimeout(res, this.options.pingInterval));

        const webhook = this.webhooks[id];

        if (!webhook) return false;

        if (webhook.ping >= this.options.maxPing) {
          this.removeWebhook(id);

          return false;
        }

        await ServerRequest.ping(webhook.url);

        webhook.ping = 0;

        return true;
      } catch (error) {
        const webhook = this.webhooks[id];

        if (!webhook) return false;

        webhook.ping += 1;
      }

      return await this.pingWebhook(id);
    },

    registerWebhook(webhook: BotWebhook): void {
      this.webhooks[webhook.id] = webhook;
    },

    removeWebhook(id: string): boolean {
      if (!this.webhooks[id]) return false;

      delete this.webhooks[id];

      return true;
    },
  };
}

export function generateBotServerOptions(options: Partial<BotServerOptions>): BotServerOptions {
  const botServerOptions: BotServerOptions = {
    serverId: options.serverId || nonce(),
    server: options.server || createServer(),
    port: options.port || 8050,
    disableAutoStart: !!options.disableAutoStart,
    pingInterval: options.pingInterval || 10000,
    maxPing: options.maxPing || 6,
    logger: options.logger || pino(),
    version: "apiV1",
  };

  return botServerOptions;
}
