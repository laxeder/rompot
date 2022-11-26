export declare class Chat {
    id: string;
    name?: string;
    isNew?: boolean;
    constructor(id: string, name?: string, isNew?: boolean);
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
     * @param isNew
     */
    setIsNew(isNew: boolean): void;
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
    getIsNew(): boolean;
}
