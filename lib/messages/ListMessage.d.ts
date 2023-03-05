import { IListMessage } from "@interfaces/Messages";
import IChat from "@interfaces/IChat";
import Message from "@messages/Message";
import { List, ListItem } from "../types/Message";
import { Client } from "../types/Client";
export default class ListMessage extends Message implements IListMessage {
    list: List[];
    button: string;
    title: string;
    footer: string;
    constructor(chat: IChat | string, text: string, buttonText: string, title?: string, footer?: string);
    addCategory(title: string, items?: Array<ListItem>): number;
    addItem(index: number, title: string, description?: string, id?: string): number;
    /**
     * @returns Retorna um ID
     */
    generateID(): string;
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends IListMessage>(bot: Client, msg: MessageIn): MessageIn & ListMessage;
}
