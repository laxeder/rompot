import type { Media } from "../types/Message";

import { MessageType } from "@enums/Message";

import { MediaMessage } from "@messages/index";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class VideoMessage extends MediaMessage {
  public readonly type: MessageType = MessageType.Video;

  public mimetype: string = "video/mp4";

  constructor(chat: Chat | string, text: string, file: Media | Buffer | string, others: Partial<VideoMessage> = {}) {
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
