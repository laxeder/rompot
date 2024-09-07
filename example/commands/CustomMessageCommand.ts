import Client, {
  Command,
  CMDKeyExact,
  Message,
  CustomMessage,
} from "../../src";

export class CustomMessageCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact("send")];
  }

  public async onExec(message: Message) {
    try {
      const [, ...texts] = message.text.split("/send");
      const text = texts.join("").trim();

      var content = JSON.parse(text);

      if (!content) {
        throw new Error("No content.");
      }

      if (typeof content !== "object") {
        throw new Error("Invalid content.");
      }
    } catch (error) {
      await message.reply(`Mensagem inválida.\n\n${error.message}`);

      return;
    }

    const customMsg = new CustomMessage(message.chat, content);

    await Client.getClient(this.clientId).send(customMsg);
  }
}

export class CustomRelayMessageCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact("send-relay")];
  }

  public async onExec(message: Message) {
    try {
      const [, ...texts] = message.text.split("/send-relay");
      const text = texts.join("").trim();

      var content = JSON.parse(text);

      if (!content) {
        throw new Error("No content.");
      }

      if (typeof content !== "object") {
        throw new Error("Invalid content.");
      }
    } catch (error) {
      await message.reply(`Mensagem inválida.\n\n${error.message}`);

      return;
    }

    const customMsg = new CustomMessage(message.chat, content, {
      extra: { isRelay: true },
    });

    await Client.getClient(this.clientId).send(customMsg);
  }
}
