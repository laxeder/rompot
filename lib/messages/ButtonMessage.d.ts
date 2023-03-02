import { ButtonMessageInterface } from "../interfaces/MessagesInterfaces";
import ChatInterface from "../interfaces/ChatInterface";
import Message from "./Message";
import { Bot } from "../types/Bot";
import { Button } from "../types/Message";
export default class ButtonMessage extends Message implements ButtonMessageInterface {
    buttons: Button[];
    footer: string;
    constructor(chat: ChatInterface | string, text: string, footer?: string);
    addUrl(text: string, url: string, index?: number): void;
    addCall(text: string, phone: string, index?: number): void;
    addReply(text: string, id?: string, index?: number): void;
    remove(index: number): void;
    generateID(): string;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends ButtonMessageInterface>(bot: Bot, msg: MessageIn): MessageIn & ButtonMessage;
}
