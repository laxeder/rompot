/// <reference types="node" />
import IUser from "@interfaces/IUser";
import Chat from "@modules/Chat";
import { Bot } from "../types/Bot";
export default class User implements IUser {
    id: string;
    name: string;
    description: string;
    profile: Buffer;
    get bot(): Bot;
    constructor(id: string, name?: string, description?: string, profile?: Buffer);
    blockUser(): Promise<void>;
    unblockUser(): Promise<void>;
    getName(): Promise<string>;
    setName(name: string): Promise<void>;
    getDescription(): Promise<string>;
    setDescription(description: string): Promise<void>;
    getProfile(): Promise<Buffer>;
    setProfile(image: Buffer): Promise<void>;
    IsAdmin(chat: Chat | string): Promise<boolean>;
    IsLeader(chat: Chat | string): Promise<boolean>;
    /**
     * @param user Usuário que será obtido
     * @returns Retorna o usuário
     */
    static getUser<UserIn extends IUser>(user: UserIn | string): UserIn | IUser;
    /**
     * @param user Usuário
     * @returns Retorna o ID do usuário
     */
    static getUserId(user: IUser | string): string;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param user Interface do usuário
     */
    static Inject<UserIn extends IUser>(bot: Bot, user: UserIn): UserIn & IUser;
}
