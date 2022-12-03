import { Bot } from "../controllers/Bot";
import { User } from "./User";
export interface ChatTypes {
    community: string;
    chanel: string;
    group: string;
    chat: string;
    pv: string;
}
export declare class Chat {
    private _bot?;
    members: {
        [key: string]: User;
    };
    type: keyof ChatTypes;
    id: string;
    name?: string;
    isOld?: boolean;
    constructor(id: string, name?: string, isOld?: boolean);
    /**
     * * Define o ID da sala de bate-papo
     * @param id
     */
    setId(id: string): void;
    /**
     * * Define o nome da sala de bate-papo
     * @param name
     */
    setName(name: string): void;
    /**
     * * Define se é uma nova sala de bate-papo
     * @param isOld
     */
    setIsOld(isOld: boolean): void;
    /**
     * * Retorna o ID da sala de bate-papo
     * @returns
     */
    getId(): string;
    /**
     * * Retorna o nome da sala de bate-papo
     * @returns
     */
    getName(): string | undefined;
    /**
     * * Retorna se é uma nova sala de bate-papo
     * @returns
     */
    getIsOld(): boolean;
    /**
     * * Define o bot da sala de bate-papo
     * @param bot
     */
    setBot(bot: Bot): void;
    /**
     * * Retorna o bot da sala de bate-papo
     * @returns
     */
    getBot(): Bot | undefined;
    /**
     * * Adiciona um novo membro a sala de bate-papo
     * @param external
     * @param member
     */
    addMember(member: User, external?: boolean): Promise<void>;
    /**
     * * Remove um membro da sala de bate-papo
     * @param member
     * @param external
     * @returns
     */
    removeMember(member: User, external?: boolean): Promise<void>;
    /**
     * * Define os membros da sala de bate-papo
     * @param members
     */
    setMembers(members: {
        [key: string]: User;
    }): void;
    /**
     * * Retorna os membros da sala de bate-papo
     * @returns
     */
    getMembers(): {
        [key: string]: User;
    };
    /**
     * * Retorna um membro da sala de bate-papo
     * @param member
     * @returns
     */
    getMember(member: User): User | undefined;
    /**
     * * Definir tipo da sala de bate-papo
     * @param type
     */
    setType(type: keyof ChatTypes): void;
    /**
     * * Retorna o tipo da sala de bate-papo
     * @returns
     */
    getType(): keyof ChatTypes;
}
