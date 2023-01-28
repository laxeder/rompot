import PromiseMessages from "@utils/PromiseMessages";
import { BotInterface } from "@models/BotInterface";
import { Message } from "@messages/Message";
import { Command } from "@models/Command";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";
import { User } from "@models/User";

type BotControl = {
  autoMessages: any;
  promiseMessages: PromiseMessages;

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

  //? ******* ***** USER ***** *******

  /**
   * @param user id do usuário ou usuário
   * @returns Retorna o nome do usuário
   */
  getUserName(user: User | string): Promise<string>;

  /**
   * @param user id do usuário ou usuário
   * @returns Retorna a descrição do usuário
   */
  getUserDescription(user: User | string): Promise<string>;

  /**
   * @param user id do usuário ou usuário
   * @returns Retorna a foto de perfil do usuário
   */
  getUserProfile(user: User | string): Promise<Buffer | null>;

  //? ******* ***** CHAT ***** *******

  /**
   * @param chat
   * @returns Retorna o nome da sala de bate-papo
   */
  getChatName(chat: Chat | string): Promise<string>;

  /**
   * @param chat
   * @returns Retorna a descrição da sala de bate-papo
   */
  getChatDescription(chat: Chat | string): Promise<string>;

  /**
   * @param chat
   * @returns Retorna a foto de perfil da sala de bate-papo
   */
  getChatProfile(chat: Chat | string): Promise<Buffer | null>;
};

type BotModule = BotInterface & BotControl;

export { BotControl, BotModule };
