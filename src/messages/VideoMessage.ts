import type { Media } from "../types/Message";

import { MessageType } from "@enums/Message";

import { IVideoMessage } from "@interfaces/IMessage";
import { IChat } from "@interfaces/IChat";

import { MediaMessage } from "@messages/index";

import { injectJSON } from "@utils/Generic";

export default class VideoMessage extends MediaMessage implements IVideoMessage {
  public readonly type = MessageType.Video;

  public mimetype: string = "video/mp4";

  constructor(chat: IChat | string, text: string, file: Media | Buffer | string, others: Partial<VideoMessage> = {}) {
    super(chat, text, file);

    injectJSON(others, this);
  }

  /**
   * @returns Obter vídeo
   */
  public getVideo() {
    return this.getStream();
  }
}
