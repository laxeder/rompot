import { IMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";
import { IUser } from "@interfaces/User";

import Message from "@messages/Message";

import Chat from "@modules/Chat";
import User from "@modules/User";

export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

/**
 * @param message Mensagem que será obtida
 * @returns Retorna a mensagem
 */
export function getMessage<MSG extends IMessage>(message: MSG | string): MSG | IMessage {
  if (typeof message == "string") {
    return new Message(new Chat(""), message);
  }

  return message;
}

/**
 * @param message Mensagem
 * @returns Retorna o ID da mensagem
 */
export function getMessageId(message: IMessage | string): string {
  if (typeof message == "string") {
    return String(message || "");
  }

  if (typeof message == "object" && !Array.isArray(message) && message?.id) {
    return String(message.id);
  }

  return String(message || "");
}

/**
 * @param chat Sala de bate-papo que será obtida
 * @returns Retorna a sala de bate-papo
 */
export function getChat<CHAT extends IChat>(chat: CHAT | string): CHAT | IChat {
  if (typeof chat == "string") {
    return new Chat(chat);
  }

  return chat;
}

/**
 * @param chat Sala de bate-papo
 * @returns Retorna o ID da sala de bate-papo
 */
export function getChatId(chat: IChat | string): string {
  if (typeof chat == "string") {
    return String(chat || "");
  }

  if (typeof chat == "object" && !Array.isArray(chat) && chat?.id) {
    return String(chat.id);
  }

  return String(chat || "");
}

/**
 * @param user Usuário que será obtido
 * @returns Retorna o usuário
 */
export function getUser<USER extends IUser>(user: USER | string): USER | IUser {
  if (typeof user == "string") {
    return new User(user);
  }

  return user;
}

/**
 * @param user Usuário
 * @returns Retorna o ID do usuário
 */
export function getUserId(user: IUser | string) {
  if (typeof user == "string") {
    return String(user || "");
  }

  if (typeof user == "object" && !Array.isArray(user) && user?.id) {
    return String(user.id);
  }

  return String(user || "");
}
