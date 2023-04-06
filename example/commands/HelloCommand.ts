import { Command, Message } from "../../src";

export class HelloCommand extends Command {
  tags: string[] = ["h", "e", "l", "l", "o"];
  reqTags: number = 3;
  prefix: string = "/";
  name: string = "Olá!";
  description: string = "Reply hello";
  categories: string[] = ["dev"];

  public async execute(message: Message): Promise<void> {
    await message.reply(`Hello World`);
  }
}
