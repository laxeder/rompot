import { IButtonMessage } from "@interfaces/Messages";
import IChat from "@interfaces/IChat";
import Message from "@messages/Message";
import { Bot } from "../types/Bot";
import { Button } from "../types/Message";
export default class ButtonMessage extends Message implements IButtonMessage {
    buttons: Button[];
    footer: string;
    constructor(chat: IChat | string, text: string, footer?: string);
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
    static Inject<MessageIn extends IButtonMessage>(bot: Bot, msg: MessageIn): MessageIn & ButtonMessage;
}
