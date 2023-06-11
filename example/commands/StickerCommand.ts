import { Command, StickerMessage, isMediaMessage, CMDKeyExact, IMessage } from "../../src";

export class StickerCommand extends Command {
  public onRead() {
    this.keys = [CMDKeyExact(..."sticker")];
  }

  public async onExec(message: IMessage) {
    const mediaMessage = message.mention || message;

    if (!isMediaMessage(mediaMessage)) {
      await message.reply("Mencione uma imagem para transforma-la em sticker");
      return;
    }

    const msg = new StickerMessage(message.chat, await mediaMessage.getStream());

    await this.client.send(msg);
  }
}
