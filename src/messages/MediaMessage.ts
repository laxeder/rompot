import { IMediaMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";

import Message from "@messages/Message";

export default class MediaMessage extends Message implements IMediaMessage {
  public isGIF: boolean = false;
  public file: any;

  constructor(chat: IChat | string, text: string, file: any, mention?: Message, id?: string) {
    super(chat, text, mention, id);

    this.file = file || Buffer.from(String(file || ""));
  }

  public async getStream(stream: any = this.file): Promise<Buffer> {
    if (Buffer.isBuffer(stream)) return stream;

    return Buffer.from(String(stream || ""));
  }
}
