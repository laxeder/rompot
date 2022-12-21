import { Bot } from "./Bot";
export declare class User {
    id: string;
    name: string;
    isAdmin: boolean;
    isLeader: boolean;
    constructor(id: string, name?: string, isAdmin?: boolean, isLeader?: boolean);
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
     * * Verifica se o usuário tem permissão
     * @param userPermissions
     * @param commandPermissions
     * @param ignore
     * @returns
     */
    checkPermissions(userPermissions: string[], commandPermissions: string[], ignore?: string[]): boolean;
}
