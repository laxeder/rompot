import { IMediaMessage, IMessage } from "@interfaces/Messages";
import { IUser } from "@interfaces/User";
import { IChat } from "@interfaces/Chat";

import Message from "@messages/Message";

export default class MediaMessage extends Message implements IMediaMessage {
  public file: any | Buffer;
  public isGIF: boolean = false;

  constructor(
    chat: IChat | string,
    text: string,
    file: any,
    mention?: IMessage,
    id?: string,
    user?: IUser | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);

    this.file = file;
  }

  public getStream(stream?: any) {
    return stream || this.file;
  }
}
