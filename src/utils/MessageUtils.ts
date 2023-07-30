import { IClient, IMessage } from "rompot-base";

import Message from "@messages/Message";

import Chat from "@modules/chat/models/Chat";

export default class MessageUtils {
  /**
   * @param message Mensagem que será obtida
   * @returns Retorna a mensagem
   */
  public static get<MSG extends IMessage>(message: MSG | string): MSG | IMessage {
    if (typeof message == "string") {
      return new Message(new Chat(""), message);
    }

    return message;
  }

  /**
   * @param message Mensagem
   * @returns Retorna o ID da mensagem
   */
  public static getId(message: IMessage | string): string {
    if (typeof message == "string") {
      return String(message || "");
    }

    if (typeof message == "object" && !Array.isArray(message) && message?.id) {
      return String(message.id);
    }

    return String(message || "");
  }

  /**
   * * Cria uma mensagem com cliente instanciado
   * @param client Cliente
   * @param msg Mensagem
   * @returns
   */
  public static applyClient<MSG extends IMessage>(client: IClient, message: MSG): MSG {
    message.client = client;
    message.chat.client = client;
    message.user.client = client;

    if (message.mention) MessageUtils.applyClient(client, message.mention);

    return message;
  }
}
