import Client, { Command, StickerMessage, CMDKeyExact, Message, MediaMessage } from "../../src";

export class StickerCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact(..."sticker")];
  }

  public async onExec(message: Message) {
    const mediaMessage = message.mention || message;

    if (!MediaMessage.isValid(mediaMessage)) {
      await message.reply("Mencione uma imagem para transforma-la em sticker");
      return;
    }

    const msg = new StickerMessage(message.chat, await mediaMessage.getStream());

    await Client.getClient(this.botId).send(msg);
  }
}
