import { Command, Message } from "../../src";

export class DateCommand extends Command {
  tags: string[] = ["date"];
  prefix: string = "/";
  name: string = "Data";
  description: string = "Send now date";
  categories: string[] = ["info"];

  public async execute(message: Message): Promise<void> {
    await message.reply(`Data: ${new Date()}`);
  }
}
