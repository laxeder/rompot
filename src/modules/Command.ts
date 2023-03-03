import ICommand from "@interfaces/ICommand";

import Message from "@messages/Message";

import BotBase from "@modules/BotBase";

import { Bot } from "../types/Bot";


export default class Command implements ICommand {
  public tags: string[] = [];
  public prefix: string = "";
  public name: string = "";
  public description: string = "";
  public categories: string[] = [];
  public permissions: string[] = [];

  get bot(): Bot {
    return new BotBase();
  }

  public async execute(message: Message): Promise<void> {}

  public async response(message: Message): Promise<void> {}

  public async help(message: Message): Promise<void> {}
}
