/// <reference types="node" />
import UserInterface from "../interfaces/UserInterface";
import Chat from "./Chat";
import { BotModule } from "../types/Bot";
export default class User implements UserInterface {
    id: string;
    name: string;
    description: string;
    profile: Buffer;
    get bot(): BotModule;
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
    static getUser<UserIn extends UserInterface>(user: UserIn | string): UserIn | UserInterface;
    /**
     * @param user Usuário
     * @returns Retorna o ID do usuário
     */
    static getUserId(user: UserInterface | string): string;
    /**
     * * Injeta a interface no modulo
     * @param bot Bot que irá executar os métodos
     * @param user Interface do usuário
     */
    static Inject<UserIn extends UserInterface>(bot: BotModule, user: UserIn): UserIn & UserInterface;
}
