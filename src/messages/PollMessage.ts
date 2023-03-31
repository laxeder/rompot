import Message from "@messages/Message";

import User from "@modules/User";
import Chat from "@modules/Chat";

import { PollOption } from "../types/Message";

export default class PollMessage extends Message {
  /** * Opções da enquete */
  public options: PollOption[] = [];
  /** * Chave secreta da enquete */
  public secretKey: Uint8Array = Buffer.from("");
  /** * Last hash votes */
  public hashVotes: { [user: string]: string[] } = {};

  constructor(
    chat: Chat | string,
    text: string,
    options?: PollOption[],
    mention?: Message,
    id?: string,
    user?: User | string,
    fromMe?: boolean,
    selected?: string,
    mentions?: string[],
    timestamp?: Number | Long
  ) {
    super(chat, text, mention, id, user, fromMe, selected, mentions, timestamp);

    this.options = options || [];
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
    return this.hashVotes[user] || [];
  }

  /**
   * * Salva os votos de um usuário
   */
  public setUserVotes(user: string, hashVotes: string[]) {
    this.hashVotes[user] = hashVotes;
  }

  /** * Transforma um objeto em PollMessage */
  public static fromJSON(message: any) {
    const pollMessage = new PollMessage(
      message?.chat?.id || "",
      message.text,
      message.options,
      message.mention,
      message.id,
      message.user.id,
      message.fromMe,
      message.selected,
      message.mentions,
      message.timestmap
    );

    pollMessage.secretKey = Buffer.from(message?.secretKey || "");
    pollMessage.hashVotes = message?.hashVotes || [];

    return pollMessage;
  }
}
