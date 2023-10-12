import Message, { MessageType } from "@messages/Message";
import Chat from "@src/chat/Chat";

import { injectJSON } from "@utils/Generic";

/**
 * Representa uma mensagem de reação, que pode ser usada para expressar reações a outras mensagens.
 */
export default class ReactionMessage extends Message {
  /** O tipo da mensagem é sempre MessageType.Reaction. */
  public readonly type = MessageType.Reaction;

  /**
   * Cria uma nova instância de ReactionMessage.
   * @param chat - O chat associado à mensagem de reação (opcional).
   * @param reaction - A reação a ser enviada (padrão é uma string vazia).
   * @param receive - A mensagem à qual a reação está associada (pode ser o ID da mensagem ou a mensagem real) (opcional).
   * @param others - Outras propriedades da mensagem de reação (opcional).
   */
  constructor(chat?: Chat | string, reaction: string = "", receive: Message | string = "", others: Partial<ReactionMessage> = {}) {
    super(chat, reaction);

    // Define o ID da mensagem com base no parâmetro 'receive'.
    this.id = typeof receive === "string" ? receive : typeof receive == "object" ? receive?.id || "" : "";

    injectJSON(others, this);
  }

  /**
   * Converte o objeto atual para uma representação em formato JSON.
   * @returns Um objeto JSON que representa o estado atual do objeto.
   */
  public toJSON(): any {
    return JSON.parse(JSON.stringify(this));
  }

  /**
   * Desserializa um objeto JSON em uma instância de ReactionMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de ReactionMessage.
   */
  public static fromJSON(data: any): ReactionMessage {
    return !data || typeof data != "object" ? new ReactionMessage() : injectJSON(data, new ReactionMessage());
  }

  /**
   * Verifica se um objeto é uma instância válida de ReactionMessage.
   * @param message - O objeto a ser verificado como uma instância de ReactionMessage.
   * @returns `true` se o objeto for uma instância válida de ReactionMessage, caso contrário, `false`.
   */
  public static isValid(message: any): message is ReactionMessage {
    return typeof message === "object" && Object.keys(new ReactionMessage()).every((key) => message?.hasOwnProperty(key));
  }
}
