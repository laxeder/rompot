import { Bot } from "./Bot";
export declare class User {
    private _bot;
    id: string;
    name?: string;
    phone?: string;
    isAdmin?: boolean;
    isOwner?: boolean;
    constructor(id: string, name?: string, phone?: string, bot?: Bot);
    /**
     * * Define o ID do usuário
     * @param id
     */
    setId(id: string): void;
    /**
     * * Define o nome do usuário
     * @param name
     */
    setName(name: string): void;
    /**
     * * Definir número do usuário
     * @param phone
     */
    setPhone(phone: string): void;
    /**
     * * Retorna o ID do usuário
     * @returns
     */
    getId(): string;
    /**
     * * Retorna o nome do usuário
     * @returns
     */
    getName(): string | undefined;
    /**
     * * Definir número do usuário
     * @returns
     */
    getPhone(): string;
    /**
     * * Define o bot do usuário
     * @param bot
     */
    setBot(bot: Bot): void;
    /**
     * * Retorna o bot do usuário
     * @returns
     */
    getBot(): Bot;
    /**
     * * Bloqueia o usuário
     */
    blockUser(): Promise<any>;
    /**
     * * Desbloqueia o usuário
     */
    unblockUser(): Promise<any>;
    /**
     * * Retorna a imagem do usuário
     * @returns
     */
    getProfile(): Promise<any>;
    /**
     * * Retorna a descrição do usuário
     * @returns
     */
    getDescription(): Promise<any>;
    /**
     * * Define se o usuáio é admin da sala de bate-papo
     * @param admin
     */
    setAdmin(admin: boolean): void;
    /**
     * * Retorna se o usuário é admin da sala de bate-papo
     * @returns
     */
    getAdmin(): boolean;
    /**
     * * Define se o usuáio é dono da sala de bate-papo
     * @param owner
     */
    setLeader(owner: boolean): void;
    /**
     * * Retorna se o usuário é dono da sala de bate-papo
     * @returns
     */
    getLeader(): boolean;
    /**
     * * Verifica se o usuário tem permissão
     * @param userPermissions
     * @param commandPermissions
     * @param ignore
     * @returns
     */
    checkPermissions(userPermissions: string[], commandPermissions: string[], ignore?: string[]): boolean;
}
