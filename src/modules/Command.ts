import { ICommand } from "@interfaces/ICommand";
import { IMessage } from "@interfaces/IMessage";
import { IClient } from "@interfaces/IClient";

import { ClientBase } from "@modules/Base";

export default class Command implements ICommand {
  public id: string = `${Date.now()}`;
  public reqTags: number = 0;
  public tags: string[] = [];
  public prefix: string = "";
  public name: string = "";
  public description: string = "";
  public categories: string[] = [];
  public permissions: string[] = [];

  #client: IClient = ClientBase();

  get client(): IClient {
    return this.#client;
  }

  set client(client: IClient) {
    this.#client = client;
  }

  public async execute(message: IMessage): Promise<any> {}

  public async response(message: IMessage): Promise<any> {}

  public async help(message: IMessage): Promise<any> {}
}
