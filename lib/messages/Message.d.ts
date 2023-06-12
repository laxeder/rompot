import { MessageType } from "../enums/Message";
import { IMessage } from "../interfaces/IMessage";
import { IClient } from "../interfaces/IClient";
import { IChat } from "../interfaces/IChat";
import { IUser } from "../interfaces/IUser";
export default class Message implements IMessage {
    #private;
    readonly type: MessageType;
    chat: IChat;
    user: IUser;
    mention?: IMessage;
    id: string;
    text: string;
    selected: string;
    fromMe: boolean;
    apiSend: boolean;
    isDeleted: boolean;
    isEdited: boolean;
    mentions: string[];
    timestamp: Number;
    get client(): IClient;
    set client(client: IClient);
    constructor(chat: IChat | string, text: string, others?: Partial<Message>);
    addReaction(reaction: string): Promise<void>;
    removeReaction(): Promise<void>;
    addAnimatedReaction(reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void>;
    reply(message: Message | string, mention?: boolean): Promise<IMessage>;
    read(): Promise<void>;
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
    static Client<MSG extends IMessage>(client: IClient, message: MSG): MSG;
}
