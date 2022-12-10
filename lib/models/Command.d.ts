import { Message } from "../messages/Message";
import { Bot } from "./Bot";
export declare class Command {
    private _bot;
    private _executeCallback;
    private _replyCallback;
    private _send?;
    permissions: Array<string>;
    category: Array<string>;
    description: string;
    allowed: boolean;
    names: string[];
    constructor(name: string | string[], description?: string, permissions?: Array<string> | string, category?: Array<string> | string, executeCallback?: Function, replyCallback?: Function);
    /**
     * * Define o bot que executa o comando
     * @param bot
     */
    setBot(bot: Bot): void;
    /**
     * * Retorna o bot que executa o comando
     * @returns
     */
    getBot(): Bot;
    /**
     * * Executa o comando
     * @param message
     * @param args
     */
    execute(message: Message, ...args: any): any;
    /**
     * * Executa a resposta do comando
     * @param args
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
    setSend(message: string | Message): Message | undefined;
    /**
     * * Define o nome do comando
     * @param name
     */
    setName(name: string[] | string): number | undefined;
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
    addName(name: string | string[]): number | undefined;
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
     * * Retorna os nomes do comando
     * @returns
     */
    getNames(): string[];
    /**
     * * Retorna os nome do comando
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
