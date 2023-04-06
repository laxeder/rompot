import { Command, Message, PollMessage } from "../../src";

export class PollCommand extends Command {
  tags: string[] = ["poll"];
  prefix: string = "/";

  public async execute(message: Message): Promise<void> {
    const msg = new PollMessage(message.chat, "Enquete");

    msg.addOption("op1", "id1");
    msg.addOption("op2", "id2");
    msg.addOption("op3", "id3");

    await this.client.send(msg);
  }
}
