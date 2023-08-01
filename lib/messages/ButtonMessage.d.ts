import { Button, IButtonMessage, IChat, MessageType } from "rompot-base";
import Message from "./Message";
export default class ButtonMessage extends Message implements IButtonMessage {
    type: MessageType.Button | MessageType.TemplateButton;
    footer: string;
    buttons: Button[];
    constructor(chat: IChat | string, text: string, footer?: string, others?: Partial<ButtonMessage>);
    /**
     * * Adiciona um botão com uma url
     * @param text Texto da botão
     * @param url Url do botão
     * @param index Posição do botão
     */
    addUrl(text: string, url: string, index?: number): void;
    /**
     * * Adiciona um botão com um telefone
     * @param text Texto do botão
     * @param phone Tefefone do botão
     * @param index Posição do botão
     */
    addCall(text: string, phone: string, index?: number): void;
    /**
     * * Adiciona um botão respondivel
     * @param text Texto do botão
     * @param id ID do botão
     * @param index Posição do botão
     */
    addReply(text: string, id?: string, index?: number): void;
    /**
     * * Remove um botão
     * @param index Posição do botão
     */
    remove(index: number): void;
}
