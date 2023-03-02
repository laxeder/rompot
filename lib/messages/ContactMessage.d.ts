import { ContactMessageInterface } from "../interfaces/MessagesInterfaces";
import ChatInterface from "../interfaces/ChatInterface";
import Message from "./Message";
import { Bot } from "../types/Bot";
export default class ContactMessage extends Message implements ContactMessageInterface {
    contacts: string[];
    constructor(chat: ChatInterface | string, text: string, contacts: string | string[], mention?: Message, id?: string);
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends ContactMessageInterface>(bot: Bot, msg: MessageIn): MessageIn & ContactMessage;
}
