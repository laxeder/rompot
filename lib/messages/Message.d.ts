/// <reference types="long" />
import { IMessage } from "@interfaces/Messages";
import IChat from "@interfaces/IChat";
import Chat from "@modules/Chat";
import User from "@modules/User";
import { Bot } from "../types/Bot";
export default class Message implements IMessage {
    id: string;
    chat: Chat;
    user: User;
    text: string;
    fromMe: boolean;
    selected: string;
    mentions: string[];
    mention?: Message;
    timestamp: Number | Long;
    get bot(): Bot;
    constructor(chat: IChat | string, text: string, mention?: IMessage, id?: string);
    addReaction(reaction: string): Promise<void>;
    reply(message: IMessage | string, mention?: boolean): Promise<Message>;
    read(): Promise<void>;
    inject<MessageIn extends IMessage>(bot: Bot, msg: MessageIn): void;
    /**
     * @param message Mensagem que será obtida
     * @returns Retorna a mensagem
     */
    static getMessage<MessageIn extends IMessage>(message: MessageIn | string): MessageIn | IMessage;
    /**
     * @param message Mensagem
     * @returns Retorna o ID da mensagem
     */
    static getMessageId(message: IMessage | string): string;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IMessage>(bot: Bot, msg: MessageIn): MessageIn & Message;
}
