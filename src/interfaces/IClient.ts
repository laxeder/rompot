import ICommand from "@interfaces/ICommand";
import IAuth from "@interfaces/IAuth";

import MediaMessage from "@messages/MediaMessage";
import Message from "@messages/Message";

import User from "@modules/User";
import Chat from "@modules/Chat";

import { ClientEvents } from "@utils/Emmiter";

import { Chats, ChatStatus } from "../types/Chat";
import { Users } from "../types/User";

export interface IClient extends ClientEvents {
  /** * Comandos do cliente */
  commands: ICommand[];

  /** * Configura os eventos do cliente */
  configEvents(): void;

  //? ****** **** COMMANDS **** ******
  /**
   * * Define os comandos do bot
   * @param commands Comandos que será injetado
   */
  setCommands(commands: ICommand[]): void;

  /**
   * @returns Retorna os comandos do bot
   */
  getCommands(): ICommand[];

  /**
   * * Adiciona um comando na lista de comandos
   * @param command Comando que será adicionado
   */
  addCommand(command: ICommand): void;

  /**
   * * Remove um comando na lista de comandos
   * @param command Comando que será removido
   */
  removeCommand(command: ICommand): void;

  /**
   * @param command Comando que será procurado
   * @returns Retorna um comando do bot
   */
  getCommand(command: string | ICommand): ICommand | null;

  //? ************ CONNECTION ************

  /**
   * * Conectar bot
   * @param auth Autenticação do bot
   */
  connect(auth: IAuth | string): Promise<void>;

  /**
   * * Reconectar bot
   * @param alert Alerta que está reconectando
   */
  reconnect(alert?: boolean): Promise<void>;

  /**
   * * Parar bot
   * @param reason Razão por parar bot
   */
  stop(reason?: any): Promise<void>;

  //? ************** MESSAGE *************

  /**
   * * Adiciona uma reação na mensagem
   * @param message Mensagem
   * @param reaction Reação
   */
  addReaction(message: Message, reaction?: string): Promise<void>;

  /**
   * * Remove a reação da mensagem
   * @param message Mensagem que terá sua reação removida
   */
  removeReaction(message: Message): Promise<void>;

  /**
   * * Adiciona animações na reação da mensagem
   * @param message Mensagem que receberá a animação
   * @param reactions Reações em sequência
   * @param interval Intervalo entre cada reação
   * @param maxTimeout Maximo de tempo reagindo
   */
  addAnimatedReaction(message: Message, reactions: string[], interval?: number, maxTimeout?: number): (reactionStop?: string) => Promise<void>;

  /**
   * * Marca uma mensagem como visualizada
   * @param message Mensagem que será visualizada
   */
  readMessage(message: Message): Promise<void>;

  /**
   * * Envia um conteúdo
   * @param content
   * @returns Retorna o conteudo enviado
   */
  send(message: Message): Promise<Message>;

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

  /**
   * * Remover mensagem
   * @param message Mensagem que será removida da sala de bate-papo
   */
  removeMessage(message: Message): Promise<void>;

  /**
   * * Deletar mensagem
   * @param message Mensagem que será deletada da sala de bate-papos
   */
  deleteMessage(message: Message): Promise<void>;

  /**
   * * Retorna a stream da mídia
   * @param message Mídia que será baixada
   * @returns Stream da mídia
   */
  downloadStreamMessage(message: MediaMessage): Promise<Buffer>;

  //? *************** BOT ***************

  /**
   * @returns Retorna o nome do bot
   */
  getBotName(): Promise<string>;

  /**
   * * Define o nome do bot
   * @param name Nome do bot
   */
  setBotName(name: string): Promise<void>;

  /**
   * @returns Retorna a descrição do bot
   */
  getBotDescription(): Promise<string>;

  /**
   * * Define a descrição do bot
   * @param description Descrição do bot
   */
  setBotDescription(description: string): Promise<void>;

  /**
   * @returns Retorna foto de perfil do bot
   */
  getBotProfile(): Promise<Buffer>;

  /**
   * * Define foto de perfil do bot
   * @param image Foto de perfil do bot
   */
  setBotProfile(image: Buffer): Promise<void>;

  //? *************** CHAT **************

  /**
   * * Adiciona uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  addChat(chat: Chat | string): Promise<void>;

  /**
   * * Remove uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  removeChat(chat: Chat | string): Promise<void>;

  /**
   * * Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  addUserInChat(chat: Chat | string, user: User | string): Promise<void>;

  /**
   * * Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  removeUserInChat(chat: Chat | string, user: User | string): Promise<void>;

  /**
   * * Promove há administrador um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  promoteUserInChat(chat: Chat | string, user: User | string): Promise<void>;

  /**
   * * Remove a administração um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  demoteUserInChat(chat: Chat | string, user: User | string): Promise<void>;

  /**
   * * Altera o status da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param status Status da sala de bate-papo
   */
  changeChatStatus(chat: Chat | string, status: ChatStatus): Promise<void>;

  /**
   * * Cria uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  createChat(chat: Chat): Promise<void>;

  /**
   * * Sai de uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  leaveChat(chat: Chat | string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna uma sala de bate-papo
   */
  getChat(chat: Chat | string): Promise<Chat | null>;

  /**
   * * Define uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  setChat(chat: Chat): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o nome da sala de bate-papo
   */
  getChatName(chat: Chat | string): Promise<string>;

  /**
   * @param chat Sala de bate-papo
   * @param name Nome da sala de bate-papo
   */
  setChatName(chat: Chat | string, name: string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a descrição da sala de bate-papo
   */
  getChatDescription(chat: Chat | string): Promise<string>;

  /**
   * @param chat Sala de bate-papo
   * @param description Descrição da sala de bate-papo
   */
  setChatDescription(chat: Chat | string, description: string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a imagem de perfil da sala de bate-papo
   */
  getChatProfile(chat: Chat | string): Promise<Buffer>;

  /**
   * @param chat Sala de bate-papo
   * @param profile Imagem de perfil da sala de bate-papo
   */
  setChatProfile(chat: Chat | string, profile: Buffer): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os administradores de uma sala de bate-papo
   */
  getChatAdmins(chat: Chat | string): Promise<Users>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o lider da sala de bate-papo
   */
  getChatLeader(chat: Chat | string): Promise<User>;

  /**
   * @returns Retorna as sala de bate-papo que o bot está
   */
  getChats(): Promise<Chats>;

  /**
   * * Define as salas de bate-papo que o bot está
   * @param chats Salas de bate-papo
   */
  setChats(chats: Chats): Promise<void>;

  //? *************** USER **************

  /**
   * * Adiciona um novo usuário
   * @param user Usuário
   */
  addUser(user: User | string): Promise<void>;

  /**
   * * Remove um usuário
   * @param user Usuário
   */
  removeUser(user: User | string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna um usuário
   */
  getUser(user: User | string): Promise<User | null>;

  /**
   * * Define um usuário
   * @param user Usuário
   */
  setUser(user: User | string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna o nome do usuário
   */
  getUserName(user: User | string): Promise<string>;

  /**
   * @param user Usuário
   * @param name Nome do usuário
   */
  setUserName(user: User | string, name: string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna a descrição do usuário
   */
  getUserDescription(user: User | string): Promise<string>;

  /**
   * @param user Usuário
   * @param description Descrição do usuário
   */
  setUserDescription(user: User | string, description: string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna a foto de perfil do usuário
   */
  getUserProfile(user: User | string): Promise<Buffer>;

  /**
   * @param user Usuário
   * @param profile Imagem de perfil do usuário
   */
  setUserProfile(user: User | string, profile: Buffer): Promise<void>;

  /**
   * * Desbloqueia um usuário
   * @param user Usuário
   */
  unblockUser(user: User | string): Promise<void>;

  /**
   * * Bloqueia um usuário
   * @param user Usuário
   */
  blockUser(user: User | string): Promise<void>;

  /**
   * @returns Retorna a lista de usuários do bot
   */
  getUsers(): Promise<Users>;

  /**
   * * Define a lista de usuários do bot
   * @param users Usuários
   */
  setUsers(users: Users): Promise<void>;
}
