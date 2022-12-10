import { Bot } from "./Bot";
import { Command } from "./Command";
export declare class Commands {
    private _bot;
    commands: {
        [key: string]: Command;
    };
    prefix?: string;
    constructor(commands?: {
        [key: string]: Command;
    }, bot?: Bot);
    /**
     * * Define um prefixo geral
     * @param prefix
     */
    setPrefix(prefix: string): void;
    /**
     * * Obter prefixo geral
     * @returns
     */
    getPrefix(): string | undefined;
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
     * * Define os comandos
     * @param commands
     */
    setCommands(commands: {
        [key: string]: Command;
    }): void;
    /**
     * * Retorna um comando
     * @param names
     * @returns
     */
    get(names: string | string[]): Command | undefined;
}
