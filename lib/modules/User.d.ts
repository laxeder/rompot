/// <reference types="node" />
import { IClient } from "../interfaces/IClient";
import { IChat } from "../interfaces/IChat";
import { IUser } from "../interfaces/IUser";
export default class User implements IUser {
    #private;
    name: string;
    id: string;
    get client(): IClient;
    set client(client: IClient);
    constructor(id: string, name?: string);
    blockUser(): Promise<void>;
    unblockUser(): Promise<void>;
    getName(): Promise<string>;
    setName(name: string): Promise<void>;
    getDescription(): Promise<string>;
    setDescription(description: string): Promise<void>;
    getProfile(): Promise<Buffer>;
    setProfile(image: Buffer): Promise<void>;
    IsAdmin(chat: IChat | string): Promise<boolean>;
    IsLeader(chat: IChat | string): Promise<boolean>;
    /**
     * @param user Usuário que será obtido
     * @returns Retorna o usuário
     */
    static get<USER extends IUser>(user: USER | string): USER | IUser;
    /**
     * @param user Usuário
     * @returns Retorna o ID do usuário
     */
    static getId(user: IUser | string): string;
    /**
     * * Cria um usuário com cliente instanciado
     * @param client Cliente
     * @param user Usuário
     * @returns
     */
    static Client<USER extends IUser>(client: IClient, user: USER | string): USER | IUser;
}
