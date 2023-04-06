import { Command, Message } from "../../src";

export class ReactCommand extends Command {
  tags: string[] = ["react"];
  prefix: string = "/";

  public async execute(message: Message): Promise<void> {
    await message.addAnimatedReaction(["❤️", "⏳"]);
  }
}
