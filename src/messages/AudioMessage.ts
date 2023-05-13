import type { Media } from "../types/Message";

import { MessageType } from "@enums/Message";

import MediaMessage from "@messages/MediaMessage";

import Chat from "@modules/Chat";

import { injectJSON } from "@utils/Generic";

export default class AudioMessage extends MediaMessage {
  public readonly type: MessageType = MessageType.Audio;

  public mimetype: string = "audio/mp4";

  constructor(chat: Chat | string, file: Media | Buffer | string, others: Partial<AudioMessage> = {}) {
    super(chat, "", file);

    injectJSON(others, this);
  }

  /**
   * @returns Obter audio
   */
  public getAudio() {
    return this.getStream();
  }
}
