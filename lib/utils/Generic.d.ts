/// <reference types="node" />
import { IMessage } from "@interfaces/Messages";
import { IChat, IChatModule } from "@interfaces/Chat";
import { IUser, IUserModule } from "@interfaces/User";
import Message from "@messages/Message";
import { ClientType } from "@modules/Client";
export declare type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;
/**
 * @param message Mensagem que será obtida
 * @returns Retorna a mensagem
 */
export declare function getMessage<MSG extends IMessage>(message: MSG | string): MSG | IMessage;
/**
 * @param message Mensagem
 * @returns Retorna o ID da mensagem
 */
export declare function getMessageId(message: IMessage | string): string;
/**
 * @param chat Sala de bate-papo que será obtida
 * @returns Retorna a sala de bate-papo
 */
export declare function getChat<CHAT extends IChat>(chat: CHAT | string): CHAT | IChat;
/**
 * @param chat Sala de bate-papo
 * @returns Retorna o ID da sala de bate-papo
 */
export declare function getChatId(chat: IChat | string): string;
/**
 * @param user Usuário que será obtido
 * @returns Retorna o usuário
 */
export declare function getUser<USER extends IUser>(user: USER | string): USER | IUser;
/**
 * @param user Usuário
 * @returns Retorna o ID do usuário
 */
export declare function getUserId(user: IUser | string): string;
/**
 * * Define o cliente de um objeto
 * @param client
 * @param obj
 */
export declare function setClientProperty(client: ClientType, obj: {
    client: ClientType;
}): void;
/**
 * * Cria uma mensagem com cliente instanciado
 * @param client Cliente
 * @param msg Mensagem
 * @returns
 */
export declare function MessageClient<MSG extends IMessage>(client: ClientType, msg: MSG): MSG & Message;
/**
 * * Cria uma sala de bate-papo com cliente instanciado
 * @param client Cliente
 * @param chat Sala de bate-papo
 * @returns
 */
export declare function ChatClient<C extends IChat>(client: ClientType, chat: C): C & IChatModule;
/**
 * * Cria um usuário com cliente instanciado
 * @param client Cliente
 * @param user Usuário
 * @returns
 */
export declare function UserClient<U extends IUser>(client: ClientType, user: U): U & IUserModule;
/**
 * * Aguarda um determinado tempo
 * @param timeout
 * @returns
 */
export declare function sleep(timeout?: number): Promise<void>;
/**
 * * Obtem a imagem de uma url
 * @param uri URL
 * @returns
 */
export declare function getImageURL(uri: string): Promise<Buffer>;
/**
 * @param err Erro
 * @returns Retorna um erro
 */
export declare function getError(err: any): any;
