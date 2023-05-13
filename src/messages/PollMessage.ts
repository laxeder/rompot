import type { PollAction, PollOption } from "../types/Message";

import { MessageType } from "@enums/Message";

import { IPollMessage } from "@interfaces/IMessage";
import { IChat } from "@interfaces/IChat";

import Message from "@messages/Message";

import { injectJSON } from "@utils/Generic";

export default class PollMessage extends Message implements IPollMessage {
  public readonly type: MessageType.Poll | MessageType.PollUpdate = MessageType.Poll;

  public votes: { [user: string]: string[] } = {};
  public secretKey: Uint8Array = Buffer.from("");
  public options: PollOption[] = [];
  public action: PollAction = "create";

  constructor(chat: IChat | string, text: string, options?: PollOption[], others: Partial<PollMessage> = {}) {
    super(chat, text);

    this.options = options || [];

    injectJSON(others, this);
  }

  /**
   * * Adiciona uma opção a enquete
   * @param name Nome da opção
   * @param id ID da opção
   */
  public addOption(name: string, id: string = `${Date.now()}`) {
    this.options.push({ name, id });
  }

  /**
   * * Remove uma opção
   * @param option Opção que será removida
   */
  public removeOption(option: PollOption) {
    const options: PollOption[] = [];

    for (const opt of this.options) {
      if (opt == option) continue;

      options.push(opt);
    }

    this.options = options;
  }

  /**
   * * Obtem os votos de um usuário
   */
  public getUserVotes(user: string) {
    return this.votes[user] || [];
  }

  /**
   * * Salva os votos de um usuário
   */
  public setUserVotes(user: string, hashVotes: string[]) {
    this.votes[user] = hashVotes;
  }

  /** * Transforma um objeto em PollMessage */
  public static fromJSON(message: any) {
    const pollMessage = new PollMessage(message?.chat?.id || "", message?.text || "", message?.options || [], message || {});

    pollMessage.secretKey = Buffer.from(message?.secretKey || "");
    pollMessage.votes = message?.votes || [];

    return pollMessage;
  }
}
