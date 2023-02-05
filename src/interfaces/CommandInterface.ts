import { MessageInterface } from "@interfaces/MessagesInterfaces";

import { BotModule } from "../types/BotModule";

export default interface CommandInterfaces {
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
   * * Bot que irá executar os métodos
   */
  bot: BotModule;

  /**
   * * Método chamado quando a função é executada
   * @param message Mensagem recebida
   */
  execute(message: MessageInterface): Promise<void>;

  /**
   * * Método chamado quando é respondido uma mensagem do comando
   * @param message
   */
  response(message: MessageInterface): Promise<void>;

  /**
   * * Método chamado quando é solicitado a ajuda do comando
   * @param message
   */
  help(message: MessageInterface): Promise<void>;
}
