import { IContactMessage } from "@interfaces/Messages";
import IChat from "@interfaces/IChat";
import Message from "@messages/Message";
import { Client } from "../types/Client";
export default class ContactMessage extends Message implements IContactMessage {
    contacts: string[];
    constructor(chat: IChat | string, text: string, contacts: string | string[], mention?: Message, id?: string);
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IContactMessage>(bot: Client, msg: MessageIn): MessageIn & ContactMessage;
}
