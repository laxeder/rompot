import Client, { Command, Message, PollMessage, CMDKeyExact, PollUpdateMessage } from "../../src";

export class PollCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact("poll")];
  }

  public async onExec(message: Message) {
    const msg = new PollMessage(message.chat, "Enquete");

    msg.addOption("op1", "poll-id1");
    msg.addOption("op2", "poll-id2");
    msg.addOption("op3", "poll-id3");

    await Client.getClient(this.botId).send(msg);
  }

  public async onReply(message: Message): Promise<void> {
    if (PollUpdateMessage.isValid(message) && message.action == "remove") return;

    await message.chat.send(`Opção ${message.text} (${message.selected}) foi selecionado!`);
  }
}
