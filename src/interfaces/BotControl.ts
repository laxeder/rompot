import PromiseMessages from "@utils/PromiseMessages";
import BotInterface from "@interfaces/BotInterface";
import { Message } from "@messages/Message";
import { Command } from "@modules/Command";
import { Status } from "@modules/Status";
import { Chat } from "@modules/Chat";

export default interface BotControl {
  promiseMessages: PromiseMessages;
  autoMessages: any;

  /**
   * * Configura o bot
   */
  configurate(): void;

  /**
   * * Configura os eventos do bot
   */
  configEvents(): void;

  //? ******* **** MESSAGE **** *******

  /**
   * * Envia um conteúdo
   * @param content
   * @returns Retorna o conteudo enviado
   */
  send<Content extends Message | Status>(content: Content): Promise<Content>;

  /**
   * * Aguarda uma mensagem ser recebida em uma sala de bate-papo
   * @param chatId Sala de bate-papo que irá receber a mensagem
   * @param ignoreMessageFromMe Ignora a mensagem se quem enviou foi o próprio bot
   * @param stopRead Para de ler a mensagem no evento
   * @param ignoreMessages Não resolve a promessa se a mensagem recebida é a mesma escolhida
   * @returns
   */
  awaitMessage(chat: Chat | string, ignoreMessageFromMe: boolean, stopRead: boolean, ...ignoreMessages: Message[]): Promise<Message>;

  /**
   * * Automotiza uma mensagem
   * @param message
   * @param timeout
   * @param chats
   * @param id
   * @returns
   */
  addAutomate(message: Message, timeout: number, chats?: { [key: string]: Chat }, id?: string): Promise<any>;

  //? ****** **** COMMANDS **** ******

  /**
   * * Define os comandos do bot
   * @param commands Comandos que será injetado
   */
  setCommands(commands: BotInterface["commands"]): void;

  /**
   * @returns Retorna os comandos do bot
   */
  getCommands(): BotInterface["commands"];

  /**
   * * Define um comando na lista de comandos
   * @param command
   */
  setCommand(command: Command): void;

  /**
   * @param command Comando que será procurado
   * @returns Retorna um comando do bot
   */
  getCommand(command: Command | string | string[]): Command | undefined;
}
