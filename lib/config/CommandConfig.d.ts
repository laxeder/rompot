import Command from "../modules/Command";
import { Commands } from "../types/Command";
export declare const DefaultCommandConfig: CommandConfig;
export default interface CommandConfig {
    /** Prefixo dos comandos */
    prefix: string;
    /**
     * @param command Comando que será procurado
     * @param commands Lista de comandos
     * @returns Retorna o comando
     */
    get(command: string, commands: Commands): Command | null;
}
