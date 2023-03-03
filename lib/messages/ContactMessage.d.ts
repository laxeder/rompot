import { IContactMessage } from "@interfaces/IMessage";
import IChat from "@interfaces/IChat";
import Message from "@messages/Message";
import { Bot } from "../types/Bot";
export default class ContactMessage extends Message implements IContactMessage {
    contacts: string[];
    constructor(chat: IChat | string, text: string, contacts: string | string[], mention?: Message, id?: string);
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IContactMessage>(bot: Bot, msg: MessageIn): MessageIn & ContactMessage;
}
