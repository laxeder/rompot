import Message, { MessageType } from "./Message";
import { injectJSON } from "../utils/Generic";
import Chat from "../chat/Chat";

/**
 * Representa uma mensagem de erro.
 */
export default class ErrorMessage extends Message {
  /** O tipo da mensagem é sempre MessageType.Error. */
  public readonly type = MessageType.Error;
  
  /** O erro da mensagem */
  public error: Error;

  /**
   * Cria uma instância de ErrorMessage.
   * @param chat - O chat ou ID do chat ao qual a mensagem pertence (opcional).
   * @param text - O texto da mensagem (opcional).
   * @param others - Outros dados a serem injetados na instância (opcional).
   */
  constructor(chat?: Chat | string, error: Error = new Error(), others: Partial<ErrorMessage> = {}) {
    super(chat, error.message);

    this.error = error;

    injectJSON(others, this);
  }

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
   * Desserializa um objeto JSON em uma instância de ErrorMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de ErrorMessage.
   */
  public static fromJSON(data: any): ErrorMessage {
    return !data || typeof data != "object" ? new ErrorMessage() : injectJSON(data, new ErrorMessage());
  }

  /**
   * Verifica se um objeto é uma instância válida de ErrorMessage.
   * @param message - O objeto a ser verificado como uma instância de ErrorMessage.
   * @returns Verdadeiro se o objeto for uma instância válida de ErrorMessage, caso contrário, falso.
   */
  public static isValid(message: any): message is ErrorMessage {
    return Message.isValid(message) && message?.type == MessageType.Error;
  }
}
