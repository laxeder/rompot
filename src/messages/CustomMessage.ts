import Chat from "../chat/Chat";
import Message, { MessageType } from "./Message";
import { injectJSON } from "../utils/Generic";

/**
 * Mensagem customizada.
 * @description Utilize para personalizar diretamente o conteúdo a ser enviado.
 */
export default class CustomMessage<T extends any = unknown> extends Message {
  /** O tipo da mensagem é sempre MessageType.Custom. */
  public readonly type = MessageType.Custom;
  /** Conteúdo que será enviado. */
  public content: T;

  /**.
   * @param chat - O chat associado à mensagem.
   * @param content - O conteúdo da mensagem.
   * @param others - Outras propriedades da mensagem.
   */
  constructor(
    chat?: Chat | string,
    content?: T,
    others: Partial<CustomMessage<T>> = {}
  ) {
    super(chat, "");

    this.content = content || ({} as T);

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
   * Desserializa um objeto JSON em uma instância de CustomMessage.
   * @param data - O objeto JSON a ser desserializado.
   * @returns Uma instância de CustomMessage.
   */
  public static fromJSON<T extends any>(data: any): CustomMessage<T> {
    return Message.fix(
      !data || typeof data != "object"
        ? new CustomMessage()
        : injectJSON(data, new CustomMessage())
    );
  }

  /**
   * Verifica se um objeto é uma instância válida de CustomMessage.
   * @param message - O objeto a ser verificado como uma instância de CustomMessage.
   * @returns Verdadeiro se o objeto for uma instância válida de CustomMessage, caso contrário, falso.
   */
  public static isValid<T extends any>(
    message: any
  ): message is CustomMessage<T> {
    return Message.isValid(message) && message?.type == MessageType.Custom;
  }
}
