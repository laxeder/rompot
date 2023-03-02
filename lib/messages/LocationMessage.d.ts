import { LocationMessageInterface } from "../interfaces/MessagesInterfaces";
import ChatInterface from "../interfaces/ChatInterface";
import Message from "./Message";
import { Bot } from "../types/Bot";
export default class LocationMessage extends Message implements LocationMessageInterface {
    latitude: number;
    longitude: number;
    constructor(chat: ChatInterface | string, latitude: number, longitude: number, mention?: Message, id?: string);
    setLocation(latitude: number, longitude: number): void;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends LocationMessageInterface>(bot: Bot, msg: MessageIn): MessageIn & LocationMessage;
}
