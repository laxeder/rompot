import { IMessage } from "@interfaces/IMessage";
import { IClient } from "@interfaces/IClient";

export interface ICommand {
  /** * Cliente do modulo */
  get client(): IClient;

  set client(client: IClient);

  /** * ID do comando */
  id: string;

  /**
   * * Tags necessárias para executar o comando,
   * 0 para todos
   */
  reqTags: number;

  /**
   * * Tags do comando
   */
  tags: string[];

  /**
   * * prefixo do comando
   */
  prefix: string;

  /**
   * * Nome do comando
   */
  name: string;

  /**
   * * Descrição do comando
   */
  description: string;

  /**
   * * Categorias do comando
   */
  categories: string[];

  /**
   * * Permissões do comando
   */
  permissions: string[];

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
}
