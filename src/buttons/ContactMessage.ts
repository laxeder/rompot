import { Message } from "@buttons/Message";
import { Chat } from "@models/Chat";
import { User } from "@models/User";

export class ContactMessage extends Message {
  public contacts: User[] = [];

  constructor(chat: Chat, text: string, user: User | User[], mention?: Message, id?: string) {
    super(chat, text, mention, id);
  }

  /**
   * * Define o usuário do contato
   * @param user
   */
  public setContacts(user: User[]) {
    this.contacts = user;
  }

  /**
   * * retorna os contatos da mensagem
   * @returns
   */
  public getContacts(): User[] {
    return this.contacts;
  }
}
