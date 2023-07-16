import { IChat, IClient } from "rompot-base";

import Chat from "@modules/chat/models/Chat";

export default class ChatUtils {
  /**
   * @param chat Sala de bate-papo que será obtida
   * @returns Retorna a sala de bate-papo
   */
  public static get<CHAT extends IChat>(chat: CHAT | string): CHAT | IChat {
    if (typeof chat == "string") {
      return new Chat(chat);
    }

    return chat;
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o ID da sala de bate-papo
   */
  public static getId(chat: IChat | string): string {
    if (typeof chat == "string") {
      return String(chat || "");
    }

    if (typeof chat == "object" && !Array.isArray(chat) && chat?.id) {
      return String(chat.id);
    }

    return String(chat || "");
  }

  /**
   * * Cria uma sala de bate-papo com cliente instanciado
   * @param client Cliente
   * @param chat Sala de bate-papo
   */
  public static applyClient<CHAT extends IChat>(client: IClient, chat: CHAT | string): CHAT | IChat {
    if (typeof chat == "string") return this.applyClient(client, new Chat(chat));

    chat.client = client;

    return chat;
  }
}
