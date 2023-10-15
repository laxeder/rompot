import Message, { MessageType } from "./Message";
import { injectJSON } from "../utils/Generic";

/**
 * Representa uma mensagem vazia.
 */
export default class EmptyMessage extends Message {
  /** O tipo da mensagem é sempre MessageType.Empty. */
  public readonly type = MessageType.Empty;

  /**
   * Converte o objeto atual para uma representação em formato JSON.
   * @returns Um objeto JSON que representa o estado atual do objeto.
   */
  public toJSON(): any {
    const data: Record<string, any> = {};

    for (const key of Object.keys(this)) {
      if (key == "toJSON") continue;

      data[key] = this[key];
    }

    return JSON.parse(JSON.stringify(data));
  }

  /**
   * Desserializa um objeto JSON em uma instância de EmptyMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de EmptyMessage.
   */
  public static fromJSON(data: any): EmptyMessage {
    return !data || typeof data != "object" ? new EmptyMessage() : injectJSON(data, new EmptyMessage());
  }

  /**
   * Verifica se um objeto é uma instância válida de EmptyMessage.
   * @param message - O objeto a ser verificado como uma instância de EmptyMessage.
   * @returns Verdadeiro se o objeto for uma instância válida de EmptyMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is EmptyMessage {
    return Message.isValid(message) && message?.type == MessageType.Empty;
  }
}
