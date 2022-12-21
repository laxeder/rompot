/// <reference types="node" />
import { ChatTypes } from "../types/Chat";
import { User } from "./User";
import { Bot } from "./Bot";
export declare class Chat {
    id: string;
    name: string;
    description: string;
    type: ChatTypes;
    members: {
        [key: string]: User;
    };
    constructor(id: string, name?: string, description?: string, type?: ChatTypes);
    /**
     * * Define o nome da sala de bate-papo
     * @param name
     */
    setName(name: string): Promise<void>;
    /**
     * * Define a descrição da sala de bate-papo
     * @param desc
     */
    setDescription(desc: string): Promise<void>;
    /**
     * * Define o bot da sala de bate-papo
     * @param bot
     */
    setBot(bot: Bot): void;
    /**
     * * Retorna o bot da sala de bate-papo
     * @returns
     */
    getBot(): Bot;
    /**
     * * Adiciona um novo membro a sala de bate-papo
     * @param member
     */
    addMember(member: User | string): Promise<void>;
    /**
     * * Remove um membro da sala de bate-papo
     * @param member
     * @returns
     */
    removeMember(member: User | string): Promise<void>;
    /**
     * * Retorna um membro da sala de bate-papo
     * @param member
     * @returns
     */
    getMember(member: User | string): User | undefined;
    /**
     * * Retorna a imagem do chat
     * @returns
     */
    getProfile(): Promise<any>;
    /**
     * * Define a imagem da sala de bate-papo
     * @param image
     */
    setProfile(image: Buffer): Promise<any>;
    /**
     * * Sai da sala de bate-papo
     * @returns
     */
    leave(): Promise<any>;
}
