import ConnectionConfig from "../configs/ConnectionConfig";

import Message from "../messages/Message";
import MediaMessage from "../messages/MediaMessage";

import ChatStatus from "../chat/ChatStatus";
import Chat from "../chat/Chat";
import User from "../user/User";

import CommandController from "../command/CommandController";
import Command from "../command/Command";

import { QuickResponsePattern } from "../quickResponse/QuickResponsePattern";
import { QuickResponseReply } from "../quickResponse/QuickResponseReply";
import QuickResponseOptions from "../quickResponse/QuickResponseOptions";
import QuickResponse from "../quickResponse/QuickResponse";

import ClientEvents, { ClientEventsMap } from "./ClientEvents";
import ClientFunctionHandler from "./ClientFunctionHandler";
import IAuth from "./IAuth";

import IBot from "../bot/IBot";

import MessageHandler, { MessageHandlerConfig } from "../utils/MessageHandler";
import Call from "../models/Call";

export default interface IClient<Bot extends IBot = IBot> extends ClientEvents {
  /** Tratador de mensagens */
  messageHandler: MessageHandler;
  /** Controlador de comandos  */
  commandController: CommandController;
  /** Configuração */
  config: ConnectionConfig;
  /** Bot */
  bot: Bot;
  /** Vezes que o bot reconectou */
  reconnectTimes: number;
  /** Id do cliente */
  id: string;
  /** Tratador de funções */
  funcHandler: ClientFunctionHandler<
    Bot,
    | "bot"
    | "chat"
    | "user"
    | "message"
    | "sendMessage"
    | "sendMediaMessage"
    | "downloadMedia"
  >;

  /** Configura os eventos do cliente */
  configEvents(): void;

  /** Conectar bot
   * @param auth Autenticação do bot
   */
  connect(auth: IAuth | string): Promise<void>;

  /** Reconectar bot
   * @param alert Alerta que está reconectando
   */
  reconnect(alert?: boolean): Promise<void>;

  /** Parar bot
   * @param reason Razão por parar bot
   */
  stop(reason?: any): Promise<void>;

  /**
   * Desconecta o bot
   */
  logout(): Promise<void>;

  /**
   * * Aguarda um evento ser chamado.
   * @param eventName - Nome do evento que será aguardado.
   * @param maxTimeout - Para automaticamente após
   * @returns {Promise<ClientEventsMap[T]>} Argumento retornado do evento esperado.
   */
  awaitEvent<T extends keyof ClientEventsMap>(
    eventName: T,
    maxTimeout?: number
  ): Promise<ClientEventsMap[T]>;

  /**
   * * Aguarda a conexão for aberta.
   */
  awaitConnectionOpen(): Promise<void>;

  /** @returns Controlador de comando do cliente */
  getCommandController(): CommandController;

  /** Define o controlador de comando do cliente */
  setCommandController(controller: CommandController): void;

  /** Define os comandos do bot
   * @param commands Comandos que será injetado
   */
  setCommands(commands: Command[]): void;

  /** @returns Retorna os comandos do bot */
  getCommands(): void;

  /** Adiciona um comando na lista de comandos
   * @param command Comando que será adicionado
   */
  addCommand(command: Command): void;

  /** Remove um comando na lista de comandos
   * @param command Comando que será removido
   */
  removeCommand(command: Command): boolean;

  /**
   * Procura um comando no texto.
   * @param text - Texto que contem o comando.
   * */
  searchCommand(text: string): Command | null;

  /**
   * Execução do comando.
   * @param command - Comando que será executado.
   * @param message - Mensagem associada ao comando.
   */
  runCommand(command: Command, message: Message, type?: string);

  /** Adiciona uma resposta rápida */
  addQuickResponse(pattern: QuickResponse): QuickResponse;
  addQuickResponse(
    pattern: QuickResponsePattern,
    reply: QuickResponseReply,
    options?: Partial<QuickResponseOptions>
  ): QuickResponse;
  addQuickResponse(
    pattern: QuickResponsePattern[],
    reply: QuickResponseReply,
    options?: Partial<QuickResponseOptions>
  ): QuickResponse;
  addQuickResponse(
    content: QuickResponse | QuickResponsePattern | QuickResponsePattern[],
    reply?: QuickResponseReply,
    options?: Partial<QuickResponseOptions>
  ): QuickResponse;

  /** Remove uma resposta rápida */
  removeQuickResponse(quickMessage: QuickResponse | string): void;

  /**
   * Deletar mensagem
   * @param message Mensagem que será deletada da sala de bate-papos
   */
  deleteMessage(message: Message): Promise<void>;

  /** Remover mensagem
   * @param message Mensagem que será removida da sala de bate-papo
   */
  removeMessage(message: Message): Promise<void>;

  /** Marca uma mensagem como visualizada
   * @param message Mensagem que será visualizada
   */
  readMessage(message: Message): Promise<void>;

  /** Edita o texto de uma mensagem enviada
   * @param message Mensagem que será editada
   * @param text Novo texto da mensagem
   */
  editMessage(message: Message, text: string): Promise<void>;

  /** Adiciona uma reação na mensagem
   * @param message Mensagem
   * @param reaction Reação
   */
  addReaction(message: Message, reaction: string): Promise<void>;

  /** Remove a reação da mensagem
   * @param message Mensagem que terá sua reação removida
   */
  removeReaction(message: Message): Promise<void>;

  /** Adiciona animações na reação da mensagem
   * @param message Mensagem que receberá a animação
   * @param reactions Reações em sequência
   * @param interval Intervalo entre cada reação
   * @param maxTimeout Maximo de tempo reagindo
   */
  addAnimatedReaction(
    message: Message,
    reactions: string[],
    interval?: number,
    maxTimeout?: number
  ): (reactionStop?: string) => Promise<void>;

  /** Envia uma mensagem
   * @param message Menssagem que será enviada
   * @returns Retorna o conteudo enviado
   */
  send(message: Message): Promise<Message>;

  /** Envia uma mensagem
   * @param chat Sala de bate-papo onde irá ser enviado a mensagem
   * @param message Mensagem que será enviada
   * @param mention Mensagem que será mencionada
   */
  sendMessage(
    chat: Chat | string,
    message: string | Message,
    mention?: Message
  ): Promise<Message>;

  /** Aguarda uma mensagem ser recebida em uma sala de bate-papo
   * @param chat Sala de bate-papo que irá receber a mensagem
   * @param config Configuração do aguardo da mensagem
   */
  awaitMessage(
    chat: Chat | string,
    config?: Partial<MessageHandlerConfig>
  ): Promise<Message>;

  /**
   * Retorna a stream da mídia
   * @param message Mídia que será baixada
   * @returns Stream da mídia
   */
  downloadStreamMessage(message: MediaMessage): Promise<Buffer>;

  /** @returns Retorna o nome do bot */
  getBotName(): Promise<string>;

  /** Define o nome do bot
   * @param name Nome do bot
   */
  setBotName(name: string): Promise<void>;

  /** @returns Retorna a descrição do bot */
  getBotDescription(): Promise<string>;

  /** Define a descrição do bot
   * @param description Descrição do bot
   */
  setBotDescription(description: string): Promise<void>;

  /** @returns Retorna foto de perfil do bot */
  getBotProfile(lowQuality?: boolean): Promise<Buffer>;

  /** Define a imagem de perfil do bot
   * @param image Imagem de perfil do bot
   */
  setBotProfile(profile: Buffer): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna uma sala de bate-papo
   */
  getChat(chat: Chat | string): Promise<Chat | null>;

  /**
   * Atualiza os dados de um chat.
   * @param id - Id do chat que será atualizado.
   * @param chat - Dados do chat que será atualizado.
   */
  updateChat(id: string, chat: Partial<Chat>): Promise<void>;

  /** @returns Retorna as sala de bate-papo que o bot está */
  getChats(): Promise<Chat[]>;

  /** Define as salas de bate-papo que o bot está
   * @param chats Salas de bate-papo
   */
  setChats(chats: Chat[]): Promise<void>;

  /** Remove uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  removeChat(chat: string | Chat): Promise<void>;

  /** Cria uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  createChat(chat: Chat): Promise<void>;

  /** Sai de uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  leaveChat(chat: Chat | string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o nome da sala de bate-papo
   */
  getChatName(chat: Chat | string): Promise<string>;

  /** Define o nome da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param name Nome da sala de bate-papo
   */
  setChatName(chat: Chat | string, name: string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a descrição da sala de bate-papo
   */
  getChatDescription(chat: Chat | string): Promise<string>;

  /** Define a descrição da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param description Descrição da sala de bate-papo
   */
  setChatDescription(chat: Chat | string, description: string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a imagem de perfil da sala de bate-papo
   */
  getChatProfile(chat: Chat | string, lowQuality?: boolean): Promise<Buffer>;

  /** Define a imagem de perfil da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param profile Imagem de perfil da sala de bate-papo
   */
  setChatProfile(chat: Chat | string, profile: Buffer): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o lider da sala de bate-papo
   */
  getChatLeader(chat: Chat | string): Promise<User>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os usuários de uma sala de bate-papo
   */
  getChatUsers(chat: Chat | string): Promise<string[]>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os administradores de uma sala de bate-papo
   */
  getChatAdmins(chat: Chat | string): Promise<string[]>;

  /** Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  addUserInChat(chat: Chat | string, user: User | string): Promise<void>;

  /** Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  removeUserInChat(chat: Chat | string, user: User | string): Promise<void>;

  /** Promove há administrador um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  promoteUserInChat(chat: Chat | string, user: User | string): Promise<void>;

  /** Remove a administração um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  demoteUserInChat(chat: Chat | string, user: User | string): Promise<void>;

  /** Altera o status da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param status Status da sala de bate-papo
   */
  changeChatStatus(chat: Chat | string, status: ChatStatus): Promise<void>;

  /**
   * Entra no chat pelo código de convite.
   * @param code - Código de convite do chat.
   */
  joinChat(code: string): Promise<void>;

  /**
   * Obtem o código de convite do chat.
   * @param chat - Chat que será obtido o código de convite.
   * @returns O código de convite do chat.
   */
  getChatInvite(chat: Chat | string): Promise<string>;

  /**
   * Revoga o código de convite do chat.
   * @param chat - Chat que terá seu código de convite revogado.
   * @returns O novo código de convite do chat.
   */
  revokeChatInvite(chat: Chat | string): Promise<string>;

  /**
   * Rejeita uma chamada.
   * @param call - A chamada que será rejeitada.
   */
  rejectCall(call: Call | string): Promise<void>;

  /** @returns Retorna a lista de usuários do bot */
  getUsers(): Promise<User[]>;

  /**
   * Obter lista de usuários salvos.
   * @returns Lista de usuários salvos.
   */
  getSavedUsers(): Promise<User[]>;

  /** Define a lista de usuários do bot
   * @param users Usuários
   */
  setUsers(users: User[]): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna um usuário
   */
  getUser(user: User | string): Promise<User | null>;

  /**
   * Atualiza os dados de um usuário.
   * @param id - Id do usuário que será atualizado.
   * @param user - Dados do usuário que será atualizado.
   */
  updateUser(id: string, user: Partial<User>): Promise<void>;

  /** Remove um usuário
   * @param user Usuário
   */
  removeUser(user: User | string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna o nome do usuário
   */
  getUserName(user: User | string): Promise<string>;

  /** Define o nome do usuário
   * @param user Usuário
   * @param name Nome do usuário
   */
  setUserName(user: User | string, name: string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna a descrição do usuário
   */
  getUserDescription(user: User | string): Promise<string>;

  /** Define a descrição do usuário
   * @param user Usuário
   * @param description Descrição do usuário
   */
  setUserDescription(user: User | string, description: string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna a foto de perfil do usuário
   */
  getUserProfile(user: User | string, lowQuality?: boolean): Promise<Buffer>;

  /** Define a imagem de perfil do usuário
   * @param user Usuário
   * @param profile Imagem de perfil do usuário
   */
  setUserProfile(user: User | string, profile: Buffer): Promise<void>;

  /** Desbloqueia um usuário
   * @param user Usuário
   */
  unblockUser(user: User | string): Promise<void>;

  /** Bloqueia um usuário
   * @param user Usuário
   */
  blockUser(user: User | string): Promise<void>;
}
