/// <reference types="long" />
import { MessageInterface } from "../interfaces/MessagesInterfaces";
import ChatInterface from "../interfaces/ChatInterface";
import Chat from "../modules/Chat";
import User from "../modules/User";
import { Bot } from "../types/Bot";
export default class Message implements MessageInterface {
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
    constructor(chat: ChatInterface | string, text: string, mention?: MessageInterface, id?: string);
    addReaction(reaction: string): Promise<void>;
    reply(message: MessageInterface | string, mention?: boolean): Promise<Message>;
    read(): Promise<void>;
    inject<MessageIn extends MessageInterface>(bot: Bot, msg: MessageIn): void;
    /**
     * @param message Mensagem que será obtida
     * @returns Retorna a mensagem
     */
    static getMessage<MessageIn extends MessageInterface>(message: MessageIn | string): MessageIn | MessageInterface;
    /**
     * @param message Mensagem
     * @returns Retorna o ID da mensagem
     */
    static getMessageId(message: MessageInterface | string): string;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends MessageInterface>(bot: Bot, msg: MessageIn): MessageIn & Message;
}
