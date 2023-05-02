/// <reference types="node" />
import Chat from "./Chat";
import { ClientType } from "../types/Client";
export default class User {
    #private;
    /** * Nome do usuário */
    name: string;
    /** * ID */
    id: string;
    get client(): ClientType;
    set client(client: ClientType);
    constructor(id: string, name?: string);
    /** * Bloqueia o usuário */
    blockUser(): Promise<void>;
    /** Desbloqueia o usuário */
    unblockUser(): Promise<void>;
    /**
     * @returns Retorna o nome do usuário
     */
    getName(): Promise<string>;
    /**
     * * Define o nome do usuário
     * @param name Nome do usuáro
     */
    setName(name: string): Promise<void>;
    /**
     * @returns Retorna a descrição do usuário
     */
    getDescription(): Promise<string>;
    /**
     * * Define a descrição do usuário
     * @param description Descrição do usuário
     */
    setDescription(description: string): Promise<void>;
    /**
     * @returns Retorna a imagem de perfil do usuário
     */
    getProfile(): Promise<Buffer>;
    /**
     * * Define a foto de perfil do usuário
     * @param image Foto de perfil do usuário
     */
    setProfile(image: Buffer): Promise<void>;
    /**
     * @param chat Sala de bate-papo que está o usuário
     * @returns Retorna se o usuário é administrador daquela sala de bate-papo
     */
    IsAdmin(chat: Chat | string): Promise<boolean>;
    /**
     * @param chat Sala de bate-papo que está o usuário
     * @returns Retorna se o usuário é lider daquela sala de bate-papo
     */
    IsLeader(chat: Chat | string): Promise<boolean>;
    /**
     * @param user Usuário que será obtido
     * @returns Retorna o usuário
     */
    static get<USER extends User>(user: USER | string): USER | User;
    /**
     * @param user Usuário
     * @returns Retorna o ID do usuário
     */
    static getId(user: User | string): string;
    /**
     * * Cria um usuário com cliente instanciado
     * @param client Cliente
     * @param user Usuário
     * @returns
     */
    static Client<USER extends User>(client: ClientType, user: USER | string): USER | User;
}
