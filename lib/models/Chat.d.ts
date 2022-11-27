export declare class Chat {
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
}
