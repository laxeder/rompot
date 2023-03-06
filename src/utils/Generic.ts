import { Transform } from "stream";
import https from "https";

import { IMessage } from "@interfaces/Messages";
import { IChat } from "@interfaces/Chat";
import { IUser } from "@interfaces/User";

import { Message } from "@messages/Message";

import { ClientType } from "@modules/Client";
import { User } from "@modules/User";
import { Chat } from "@modules/Chat";

export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;

/**
 * @param message Mensagem que será obtida
 * @returns Retorna a mensagem
 */
export function getMessage<MSG extends IMessage>(message: MSG | string): MSG | IMessage {
  if (typeof message == "string") {
    return Message(Chat(""), message);
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
    return Chat(chat);
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
    return User(user);
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

/**
 * * Define o cliente de um objeto
 * @param client
 * @param obj
 */
export function setClientProperty(client: ClientType, obj: { client: ClientType }) {
  Object.defineProperty(obj, "client", {
    get: () => client,
    set: (value: ClientType) => (client = value),
  });
}

/**
 * * Aguarda um determinado tempo
 * @param timeout
 * @returns
 */
export async function sleep(timeout: number = 1000): Promise<void> {
  const result = timeout - 2147483647;

  if (result > 0) {
    await new Promise((res) => setTimeout(res, 2147483647));

    await sleep(result);
  } else {
    await new Promise((res) => setTimeout(res, timeout));
  }
}

/**
 * * Obtem a imagem de uma url
 * @param uri URL
 * @returns
 */
export async function getImageURL(uri: string): Promise<Buffer> {
  if (!!!uri) return Buffer.from("");

  return new Promise((res, rej) => {
    try {
      https
        .request(uri, (response) => {
          var data = new Transform();

          response.on("data", (chunk) => data.push(chunk));
          response.on("end", () => res(data.read()));
        })
        .end();
    } catch (e) {
      res(Buffer.from(""));
    }
  });
}

/**
 * @param err Erro
 * @returns Retorna um erro
 */
export function getError(err: any): any {
  if (!(err instanceof Error)) {
    err = new Error(`${err}`);
  }

  return err;
}
