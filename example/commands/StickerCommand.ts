import { Command, ImageMessage, Message, PollMessage, StickerMessage } from "../../src";

export class StickerCommand extends Command {
  tags: string[] = ["s", "t", "i", "c", "k", "e", "r"];
  reqTags: number = 1;
  prefix: string = "/";

  public async execute(message: Message): Promise<void> {
    const imageMessage = message.mention || message;

    if (!(imageMessage instanceof ImageMessage)) {
      await message.reply("Mencione uma imagem para transforma-la em sticker");
      return;
    }

    const msg = new StickerMessage(message.chat, await imageMessage.getImage());

    await this.client.send(msg);
  }
}
