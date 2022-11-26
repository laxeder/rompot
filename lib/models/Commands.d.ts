export declare class Command {
    private _executeCallback;
    private _replyCallback;
    permissions: Array<string>;
    category: Array<string>;
    allowed: boolean;
    description: string;
    name: string;
    constructor(name: string, description?: string, permissions?: Array<string> | string, category?: Array<string> | string, executeCallback?: Function, replyCallback?: Function);
    execute(...args: any): any;
    reply(...args: any): any;
    setExecute(executeCallback: Function): void;
    setReply(replyCallback: Function): void;
    setName(name: string): void;
    setDescription(description: string): void;
    setAllowed(allowed: boolean): void;
    setPermission(permissions: Array<string> | string): void;
    setCategory(category: Array<string> | string): void;
    addPermission(permissions: Array<string> | string): void;
    addCategory(category: Array<string> | string): void;
    getName(): string;
    getDescription(): string;
    getPermission(): Array<string>;
    getCategory(): Array<string>;
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
     * @returns
     */
    get(name: string, lower?: boolean): Command | undefined;
}
