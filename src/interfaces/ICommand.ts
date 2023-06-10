import { IMessage } from "@interfaces/IMessage";
import { IClient } from "@interfaces/IClient";
import { IUser } from "./IUser";
import Chat from "@modules/Chat";
import { IChat } from "./IChat";

export interface ICommand {
  /** * Cliente do modulo */
  get client(): IClient;

  set client(client: IClient);

  /** * ID do comando */
  id: string;

  /**
   * * Tags do comando
   */
  tags: string[];


  /**
   * * Método chamado quando a função é executada
   * @param message Mensagem recebida
   */
  execute(message: IMessage): Promise<any>;

  /**
   * * Método chamado quando é respondido uma mensagem do comando
   * @param message
   */
  response(message: IMessage): Promise<any>;

  /**
   * * Método chamado quando é solicitado a ajuda do comando
   * @param message
   */
  help(message: IMessage): Promise<any>;

  /** * Configuração do comando */
  onConfig?: () => any;

  /** * Verifica há permissão para executar o comando  */
  checkPermissions?: (chat: IChat, user: IUser) => Promise<boolean> | boolean;
}
