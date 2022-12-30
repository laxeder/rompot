import { Command } from "./Command";
import { Bot } from "./Bot";
export declare class Commands {
    private _bot;
    private prefix?;
    private maxCommandLength;
    private commands;
    constructor(commands?: {
        [key: string]: Command;
    }, prefix?: string);
    /**
     * * Atualiza os comandos
     */
    update(commands?: {
        [key: string]: Command;
    }): void;
    /**
     * * Define um prefixo geral
     * @param prefix
     */
    setPrefix(prefix: string): void;
    /**
     * * Obter prefixo geral
     * @returns
     */
    getPrefix(command?: Command): string | undefined;
    /**
     * * Define o bot que executa os comandos
     * @param bot
     */
    setBot(bot: Bot): void;
    /**
     * * Retorna o bot que executa os comandos
     * @returns
     */
    getBot(): Bot;
    /**
     * * Adiciona um comando
     * @param command
     */
    addCommand(command: Command): void;
    /**
     * * remove um comando
     * @param command
     */
    removeCommand(command: Command): void;
    /**
     * * Define os comandos
     * @param commands
     */
    setCommands(commands: {
        [key: string]: Command;
    } | Command[]): void;
    /**
     * * Retorna um comando
     * @param names
     * @returns
     */
    getCommand(names: string | string[]): Command | undefined;
}
