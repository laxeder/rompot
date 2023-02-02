import Message from "@messages/Message";
import BotBase from "@modules/BotBase";

import { CommandModule } from "../types/Command";
import { BotModule } from "../types/BotModule";

export class Command implements CommandModule {
  public tags: string[] = [];
  public prefix: string = "";
  public name: string = "";
  public description: string = "";
  public categories: string[] = [];
  public permissions: string[] = [];

  get bot(): BotModule {
    return new BotBase();
  }

  constructor(tags: string[] | string, prefix?: string, name?: string, description?: string, categories?: string[] | string, permissions?: string[] | string = ) {
    if (typeof tags == "string") {
      this.tags.push(tags);
    } else {
      this.tags.push(...tags);
    }

    this.prefix = prefix || "";
    this.name = name || "";
    this.description = description || "";

    if (categories && Array.isArray(categories)) {
      this.categories.push(...categories);
    } else {
      this.categories.push(categories || "");
    }

    if (permissions && Array.isArray(permissions)) {
      this.permissions.push(...permissions);
    } else {
      this.permissions.push(permissions || "");
    }
  }

  public async execute(message: Message): Promise<void> {}

  public async response(message: Message): Promise<void> {}

  public async help(message: Message): Promise<void> {}
}
