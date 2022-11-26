export declare class Command {
    private _executeCallback;
    private _replyCallback;
    permissions: Array<string>;
    category: Array<string>;
    allowed: boolean;
    description: string;
    name: string;
    constructor(name: string, description?: string, permissions?: Array<string> | string, category?: Array<string> | string, executeCallback?: Function, replyCallback?: Function);
    /**
     * * Executa o comando
     */
    execute(...args: any): any;
    /**
     * * Executa a resposta do comando
     */
    reply(...args: any): any;
    /**
     * * Define a função do comando
     * @param executeCallback
     */
    setExecute(executeCallback: Function): void;
    /**
     * * Define uma resposta ao comando
     * @param replyCallback
     */
    setReply(replyCallback: Function): void;
    /**
     * * Define o nome do comando
     * @param name
     */
    setName(name: string): void;
    /**
     * * Define a descrição do comando
     * @param description
     */
    setDescription(description: string): void;
    /**
     * * Define se está permitido
     * @param allowed
     */
    setAllowed(allowed: boolean): void;
    /**
     * * Define a permissão do comando
     * @param permissions
     */
    setPermission(permissions: Array<string> | string): void;
    /**
     * * Define a categoria do comando
     * @param category
     */
    setCategory(category: Array<string> | string): void;
    /**
     * * Adiciona  uma permissão ao comando
     * @param permissions
     */
    addPermission(permissions: Array<string> | string): void;
    /**
     * * Adiciona uma categoria ao comando
     * @param category
     */
    addCategory(category: Array<string> | string): void;
    /**
     * * Retorna o nome do comando
     * @returns
     */
    getName(): string;
    /**
     * * Retorna a descricão do comando
     * @returns
     */
    getDescription(): string;
    /**
     * * Retorna a permissão do comando
     * @returns
     */
    getPermission(): Array<string>;
    /**
     * * Retorna a categoria do comando
     * @returns
     */
    getCategory(): Array<string>;
    /**
     * * Retorna se está permetido
     * @returns
     */
    getAllowed(): boolean;
}
export declare class Commands {
    commands: {
        [key: string]: Command;
    };
    constructor(commands?: {
        [key: string]: Command;
    });
    /**
     * * Define um comando
     * @param name
     * @param command
     */
    setCommand(name: string, command: Command): void;
    /**
     * * Define os comandos
     * @param commands
     */
    setCommands(commands: {
        [key: string]: Command;
    }): void;
    /**
     * * Retorna um comando
     * @param name
     * @param lower
     * @returns
     */
    get(name: string, lower?: boolean): Command | undefined;
}
