export declare class User {
    id: string;
    name?: string;
    phone?: string;
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
     * * Verifica se o usuário tem permissão
     * @param userPermissions
     * @param commandPermissions
     * @param ignore
     * @returns
     */
    checkPermissions(userPermissions: string[], commandPermissions: string[], ignore?: string[]): boolean;
}
