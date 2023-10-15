import ReactionMessage from "../messages/ReactionMessage";
import { Media } from "../messages/MediaMessage";
import { ChatStatus } from "../chat/ChatStatus";
import Message from "../messages/Message";
import { BotStatus } from "./BotStatus";
import IAuth from "../client/IAuth";
import BotEvents from "./BotEvents";
import User from "../user/User";
import Chat from "../chat/Chat";

/** Interface do bot */
export default interface IBot extends BotEvents {
  /** ID do bot */
  id: string;

  /* Status do Client */
  status: BotStatus;

  /** Conectar bot
   * @param auth Autenticação do bot
   */
  connect(auth: IAuth | string): Promise<void>;

  /**
   * * Conectar bot pelo código
   * @param phoneNumber Número do bot
   * @param auth Autenticação do bot
   */
  connectByCode(phoneNumber: string, auth: IAuth | string): Promise<string>;

  /** Reconectar bot
   * @param alert Alerta que está reconectando
   */
  reconnect(alert?: boolean): Promise<void>;

  /** Parar bot
   * @param reason Razão por parar o bot
   */
  stop(reason?: any): Promise<void>;

  /** Marca uma mensagem como visualizada
   * @param message Mensagem que será visualizada
   */
  readMessage(message: Message): Promise<void>;

  /** Adiciona uma reação na mensagem
   * @param message Mensagem
   * @param reaction Reação
   */
  addReaction(message: ReactionMessage): Promise<void>;

  /** Remove a reação da mensagem
   * @param Mensagem que terá sua reação removida
   */
  removeReaction(message: ReactionMessage): Promise<void>;

  /** Edita o texto de uma mensagem enviada
   * @param message Mensagem com o texto editado
   */
  editMessage(message: Message): Promise<void>;

  /** Enviar mensagem
   * @param message Mensagem que será enviada
   */
  send(message: Message): Promise<Message>;

  /** Remover mensagem
   * @param message Mensagem que será removida da sala de bate-papo
   */
  removeMessage(message: Message): Promise<void>;

  /** Deletar mensagem
   * @param message Mensagem que será deletada da sala de bate-papos
   */
  deleteMessage(message: Message): Promise<void>;

  /** Retorna a stream da mídia
   * @param message Mídia que será baixada
   * @returns Stream da mídia
   */
  downloadStreamMessage(media: Media): Promise<Buffer>;

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
  getBotProfile(): Promise<Buffer>;

  /** Define foto de perfil do bot
   * @param image Foto de perfil do bot
   */
  setBotProfile(image: Buffer): Promise<void>;

  /** Adiciona uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  addChat(chat: Chat): Promise<void>;

  /** Remove uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  removeChat(chat: Chat): Promise<void>;

  /** Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  addUserInChat(chat: Chat, user: User): Promise<void>;

  /** Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  removeUserInChat(chat: Chat, user: User): Promise<void>;

  /** Promove há administrador um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  promoteUserInChat(chat: Chat, user: User): Promise<void>;

  /** Remove a administração um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  demoteUserInChat(chat: Chat, user: User): Promise<void>;

  /** Altera o status da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param status Status da sala de bate-papo
   */
  changeChatStatus(chat: Chat, status: ChatStatus): Promise<void>;

  /** Cria uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  createChat(chat: Chat): Promise<void>;

  /** Sai de uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  leaveChat(chat: Chat): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna uma sala de bate-papo
   */
  getChat(chat: Chat): Promise<Chat | null>;

  /** Define uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  setChat(chat: Chat): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o nome da sala de bate-papo
   */
  getChatName(chat: Chat): Promise<string>;

  /** Define o nome da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param name Nome da sala de bate-papo
   */
  setChatName(chat: Chat, name: string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a descrição da sala de bate-papo
   */
  getChatDescription(chat: Chat): Promise<string>;

  /** Define a descrição da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param description Descrição da sala de bate-papo
   */
  setChatDescription(chat: Chat, description: string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a imagem de perfil da sala de bate-papo
   */
  getChatProfile(chat: Chat): Promise<Buffer>;

  /** Define a imagem de perfil da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param profile Imagem de perfil da sala de bate-papo
   */
  setChatProfile(chat: Chat, profile: Buffer): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os usuários de uma sala de bate-papo
   */
  getChatUsers(chat: Chat): Promise<string[]>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os administradores de uma sala de bate-papo
   */
  getChatAdmins(chat: Chat): Promise<string[]>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o lider da sala de bate-papo
   */
  getChatLeader(chat: Chat): Promise<string>;

  /**
   * @returns Retorna as sala de bate-papo que o bot está
   */
  getChats(): Promise<string[]>;

  /** Define as salas de bate-papo que o bot está
   * @param chats Salas de bate-papo
   */
  setChats(chats: Chat[]): Promise<void>;

  /** Adiciona um novo usuário
   * @param user Usuário
   */
  addUser(user: User): Promise<void>;

  /** Remove um usuário
   * @param user Usuário
   */
  removeUser(user: User): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna um usuário
   */
  getUser(user: User): Promise<User | null>;

  /** Define um usuário
   * @param user Usuário
   */
  setUser(user: User): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna o nome do usuário
   */
  getUserName(user: User): Promise<string>;

  /** Define o nome do usuário
   * @param user Usuário
   * @param name Nome do usuário
   */
  setUserName(user: User, name: string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna a descrição do usuário
   */
  getUserDescription(user: User): Promise<string>;

  /** Define a descrição do usuário
   * @param user Usuário
   * @param description Descrição do usuário
   */
  setUserDescription(user: User, description: string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna a foto de perfil do usuário
   */
  getUserProfile(user: User): Promise<Buffer>;

  /** Define a foto de perfil do usuário
   * @param user Usuário
   * @param profile Imagem de perfil do usuário
   */
  setUserProfile(user: User, profile: Buffer): Promise<void>;

  /** Desbloqueia um usuário
   * @param user Usuário
   */
  unblockUser(user: User): Promise<void>;

  /** Bloqueia um usuário
   * @param user Usuário
   */
  blockUser(user: User): Promise<void>;

  /** @returns Retorna a lista de usuários do bot */
  getUsers(): Promise<string[]>;

  /** Define a lista de usuários do bot
   * @param users Usuários
   */
  setUsers(users: User[]): Promise<void>;
}
