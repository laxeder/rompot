import CommandInterfaces from "@interfaces/CommandInterface";

import Message from "@messages/Message";

import BotBase from "@modules/BotBase";

import { BotModule } from "../types/BotModule";

export default class Command implements CommandInterfaces {
  public tags: string[] = [];
  public prefix: string = "";
  public name: string = "";
  public description: string = "";
  public categories: string[] = [];
  public permissions: string[] = [];

  get bot(): BotModule {
    return new BotBase();
  }

  public async execute(message: Message): Promise<void> {}

  public async response(message: Message): Promise<void> {}

  public async help(message: Message): Promise<void> {}
}
