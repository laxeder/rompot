/// <reference types="long" />
import Message from "./Message";
import User from "../modules/User";
import Chat from "../modules/Chat";
import { PollOption } from "../types/Message";
export default class PollMessage extends Message {
    /** * Opções da enquete */
    options: PollOption[];
    /** * Chave secreta da enquete */
    secretKey: Uint8Array;
    /** * Last hash votes */
    hashVotes: {
        [user: string]: string[];
    };
    constructor(chat: Chat | string, text: string, options?: PollOption[], mention?: Message, id?: string, user?: User | string, fromMe?: boolean, selected?: string, mentions?: string[], timestamp?: Number | Long);
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
