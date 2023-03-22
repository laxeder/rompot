import Command from "../modules/Command";
export declare const DefaultCommandConfig: CommandConfig;
export default interface CommandConfig {
    /**
     * @param command Comando que será procurado
     * @param commands Lista de comandos
     * @param args Argumentos para encontrar comando
     * @returns Retorna o comando
     */
    get(command: string, commands: Command[], ...args: any[]): Command | null;
}
