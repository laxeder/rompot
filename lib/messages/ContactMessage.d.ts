import { Message } from "./Message";
import { Chat } from "../models/Chat";
import { User } from "../models/User";
export declare class ContactMessage extends Message {
    contacts: User[];
    constructor(chat: Chat, text: string, contacts: User | User[], mention?: Message, id?: string);
    /**
     * * Define o usuário do contato
     * @param user
     */
    setContacts(user: User[]): void;
    /**
     * * retorna os contatos da mensagem
     * @returns
     */
    getContacts(): User[];
}
