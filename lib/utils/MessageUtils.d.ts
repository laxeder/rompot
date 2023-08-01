import { IClient, IMessage } from "rompot-base";
export default class MessageUtils {
    /**
     * @param message Mensagem que será obtida
     * @returns Retorna a mensagem
     */
    static get<MSG extends IMessage>(message: MSG | string): MSG | IMessage;
    /**
     * @param message Mensagem
     * @returns Retorna o ID da mensagem
     */
    static getId(message: IMessage | string): string;
    /**
     * * Cria uma mensagem com cliente instanciado
     * @param client Cliente
     * @param msg Mensagem
     * @returns
     */
    static applyClient<MSG extends IMessage>(client: IClient, message: MSG): MSG;
}
