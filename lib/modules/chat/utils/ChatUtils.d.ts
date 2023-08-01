import { IChat, IClient } from "rompot-base";
export default class ChatUtils {
    /**
     * @param chat Sala de bate-papo que será obtida
     * @returns Retorna a sala de bate-papo
     */
    static get<CHAT extends IChat>(chat: CHAT | string): CHAT | IChat;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o ID da sala de bate-papo
     */
    static getId(chat: IChat | string): string;
    /**
     * * Cria uma sala de bate-papo com cliente instanciado
     * @param client Cliente
     * @param chat Sala de bate-papo
     */
    static applyClient<CHAT extends IChat>(client: IClient, chat: CHAT | string): CHAT | IChat;
}
