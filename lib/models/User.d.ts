export declare class User {
    id: string;
    name?: string;
    phone?: string;
    isAdmin?: boolean;
    isOwner?: boolean;
    constructor(id: string, name?: string, phone?: string);
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
