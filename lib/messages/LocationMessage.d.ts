import { ILocationMessage } from "@interfaces/Messages";
import IChat from "@interfaces/IChat";
import Message from "@messages/Message";
import { Client } from "../types/Client";
export default class LocationMessage extends Message implements ILocationMessage {
    latitude: number;
    longitude: number;
    constructor(chat: IChat | string, latitude: number, longitude: number, mention?: Message, id?: string);
    setLocation(latitude: number, longitude: number): void;
    /**
     * * Injeta a interface no modulo
     * @param bot Client que irá executar os métodos
     * @param message Interface da mensagem
     */
    static Inject<MessageIn extends ILocationMessage>(bot: Client, msg: MessageIn): MessageIn & LocationMessage;
}
