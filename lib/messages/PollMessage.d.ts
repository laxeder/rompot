import type { PollAction, PollOption } from "../types/Message";
import { MessageType } from "../enums/Message";
import { IPollMessage } from "../interfaces/IMessage";
import { IChat } from "../interfaces/IChat";
import Message from "./Message";
export default class PollMessage extends Message implements IPollMessage {
    readonly type: MessageType.Poll | MessageType.PollUpdate;
    votes: {
        [user: string]: string[];
    };
    secretKey: Uint8Array;
    options: PollOption[];
    action: PollAction;
    constructor(chat: IChat | string, text: string, options?: PollOption[], others?: Partial<PollMessage>);
    /**
     * * Adiciona uma opção a enquete
     * @param name Nome da opção
     * @param id ID da opção
     */
    addOption(name: string, id?: string): void;
    /**
     * * Remove uma opção
     * @param option Opção que será removida
     */
    removeOption(option: PollOption): void;
    /**
     * * Obtem os votos de um usuário
     */
    getUserVotes(user: string): string[];
    /**
     * * Salva os votos de um usuário
     */
    setUserVotes(user: string, hashVotes: string[]): void;
    /** * Transforma um objeto em PollMessage */
    static fromJSON(message: any): PollMessage;
}
