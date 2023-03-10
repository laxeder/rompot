/// <reference types="node" />
import Message from "../messages/Message";
import { ClientType } from "./Client";
import User from "./User";
import { ChatStatus, ChatType } from "../types/Chat";
import { Users } from "../types/User";
export default class Chat {
    #private;
    /** * ID */
    id: string;
    /** * Tipo */
    type: ChatType;
    /** * Nome */
    name: string;
    /** * Descrição */
    description: string;
    /** * Foto de perfil */
    profile: Buffer;
    /** * Usuários da sala de bate-papo */
    users: Users;
    get client(): ClientType;
    set client(client: ClientType);
    constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: Users);
    /**
     * @returns Retorna o nome da sala de bate-papo
     */
    getName(): Promise<string>;
    /**
     * * Define o nome da sala de bate-pao
     * @param name Nome da sala de bate-pao
     */
    setName(name: string): Promise<void>;
    /**
     * @returns Retorna a descrição da sala de bate-papo
     */
    getDescription(): Promise<string>;
    /**
     * * Define a descrição da sala de bate-pao
     * @param description Descrição da  sala de bate-pao
     */
    setDescription(description: string): Promise<void>;
    /**
     * @returns Retorna a imagem de perfil da sala de bate-papo
     */
    getProfile(): Promise<Buffer>;
    /**
     * * Define a foto de perfil da sala de bate-papo
     * @param image Foto de perfil da sala de bate-papo
     */
    setProfile(image: Buffer): Promise<void>;
    /**
     * @param user Usuário que será verificado
     * @returns Retorna se o usuário é administrador da sala de bate-papo
     */
    IsAdmin(user: User | string): Promise<boolean>;
    /**
     * @param user Usuário que será verificado
     * @returns Retorna se o usuário é lider da sala de bate-papo
     */
    IsLeader(user: User | string): Promise<boolean>;
    /**
     * @returns Retorna os administradores daquela sala de bate-papo
     */
    getAdmins(): Promise<Users>;
    /**
     * * Adiciona um usuário a sala de bate-papo
     * @param user Usuário que será adicionado
     */
    addUser(user: User | string): Promise<void>;
    /**
     * * Remove um usuário da sala de bate-papo
     * @param user
     */
    removeUser(user: User | string): Promise<void>;
    /**
     * * Promove a administrador um usuário da sala de bate-papo
     * @param user Usuário que será promovido
     */
    promote(user: User | string): Promise<void>;
    /**
     * * Remove o administrador de um usuário da sala de bate-papo
     * @param user Usuário que terá sua administração removida
     */
    demote(user: User | string): Promise<void>;
    /**
     * * Sai da sala de bate-papo
     */
    leave(): Promise<void>;
    /**
     * * Envia uma mensagem na sala de bate-papo que a mensagem foi enviada
     * @param message Mensagem que será enviada
     */
    send(message: Message | string): Promise<Message>;
    /**
     * * Altera o status da sala de bate-pappo
     * @param status Status da sala de bate-papo
     */
    changeStatus(status: ChatStatus): Promise<void>;
    /**
     * @param chat Sala de bate-papo que será obtida
     * @returns Retorna a sala de bate-papo
     */
    static get<CHAT extends Chat>(chat: CHAT | string): CHAT | Chat;
    /**
     * @param chat Sala de bate-papo
     * @returns Retorna o ID da sala de bate-papo
     */
    static getId(chat: Chat | string): string;
    /**
     * * Cria uma sala de bate-papo com cliente instanciado
     * @param client Cliente
     * @param chat Sala de bate-papo
     */
    static Client<CHAT extends Chat>(client: ClientType, chat: CHAT | string): CHAT | Chat;
}
