import { ListMessageInterface } from "../interfaces/MessagesInterfaces";
import ChatInterface from "../interfaces/ChatInterface";
import Message from "./Message";
import { List, ListItem } from "../types/Message";
import { Bot } from "../types/Bot";
export default class ListMessage extends Message implements ListMessageInterface {
    list: List[];
    button: string;
    title: string;
    footer: string;
    constructor(chat: ChatInterface | string, text: string, buttonText: string, title?: string, footer?: string);
    addCategory(title: string, items?: Array<ListItem>): number;
    addItem(index: number, title: string, description?: string, id?: string): number;
    /**
     * @returns Retorna um ID
     */
    generateID(): string;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends ListMessageInterface>(bot: Bot, msg: MessageIn): MessageIn & ListMessage;
}
