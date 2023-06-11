import { ICommandControllerConfig } from "./ICommandController";
import { ICommandPermission } from "./ICommandPermission";
import { ICommandKey } from "./ICommandKey";
import { IMessage } from "../IMessage";
import { IClient } from "../IClient";
/** Comando */
export interface ICommand {
    /** * Cliente do comando */
    client: IClient;
    keys: ICommandKey[];
    permissions: string[];
    /** Quando o comando está sendo procurado */
    onSearch(text: string, config: ICommandControllerConfig): ICommandKey | null;
    /** Verifica se o comando pode ser executado */
    checkPerms(message: IMessage): Promise<ICommandPermission | null>;
    /** Quando o comando é lido */
    onRead(): any;
    /** Configuração do comando */
    onConfig(message: IMessage): any;
    /** Execução do comando */
    onExec(message: IMessage): any;
    /** Respota ao comando */
    onReply(message: IMessage): any;
}
