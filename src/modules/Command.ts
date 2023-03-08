import ICommand from "@interfaces/ICommand";

import Message from "@messages/Message";

import { ClientType } from "@modules/Client";
import BotBase from "@modules/BotBase";

export default class Command implements ICommand {
  public tags: string[] = [];
  public prefix: string = "";
  public name: string = "";
  public description: string = "";
  public categories: string[] = [];
  public permissions: string[] = [];

  #client: ClientType = BotBase();

  get client(): ClientType {
    return this.#client;
  }

  set client(c: ClientType) {
    this.#client = c;
  }

  public async execute(message: Message): Promise<void> {}

  public async response(message: Message): Promise<void> {}

  public async help(message: Message): Promise<void> {}
}
