import PollMessage, { PollAction, PollOption } from "@messages/PollMessage";
import { MessageType } from "@messages/Message";
import Chat from "@src/chat/Chat";

import { injectJSON } from "@utils/Generic";

/**
 * Representa uma mensagem de atualização de enquete, que é uma extensão da mensagem de enquete.
 */
export default class PollUpdateMessage extends PollMessage {
  /** O tipo da mensagem é MessageType.PollUpdate. */
  public readonly type = MessageType.PollUpdate;

  /**
   * Ação relacionada à mensagem de atualização de enquete.
   * Pode ser PollAction.Add ou PollAction.Remove, padrão é PollAction.Add.
   */
  public action: PollAction = PollAction.Add;

  /**
   * Cria uma nova instância de PollUpdateMessage.
   * @param chat - O chat associado à mensagem de atualização de enquete (opcional).
   * @param text - O texto da mensagem (opcional).
   * @param options - Lista de opções da enquete (opcional).
   * @param others - Outras propriedades da mensagem de atualização de enquete (opcional).
   */
  constructor(chat?: Chat | string, text?: string, options?: PollOption[], others: Partial<PollUpdateMessage> = {}) {
    super(chat, text, options);

    injectJSON(others, this);
  }

  /**
   * Serializa a mensagem de atualização de enquete em um objeto JSON.
   * @returns O objeto JSON representando a mensagem de atualização de enquete.
   */
  public toJSON(): any {
    return JSON.parse(JSON.stringify(this));
  }

  /**
   * Desserializa um objeto JSON em uma instância de PollUpdateMessage.
   * @param message - O objeto JSON a ser desserializado.
   * @returns Uma instância de PollUpdateMessage.
   */
  public static fromJSON(message: any): PollUpdateMessage {
    if (!message || typeof message != "object") {
      return new PollUpdateMessage();
    }

    const pollMessage = injectJSON(message, new PollUpdateMessage());

    pollMessage.secretKey = Buffer.from(message?.secretKey || "");
    pollMessage.votes = message?.votes || [];

    return pollMessage;
  }

  /**
   * Verifica se um objeto é uma instância válida de PollUpdateMessage.
   * @param message - O objeto a ser verificado como uma instância de PollUpdateMessage.
   * @returns `true` se o objeto for uma instância válida de PollUpdateMessage, caso contrário, `false`.
   */
  public static isValid(message: any): message is PollUpdateMessage {
    return typeof message === "object" && Object.keys(new PollUpdateMessage()).every((key) => message?.hasOwnProperty(key));
  }
}
