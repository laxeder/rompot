import { ConnectionConfig } from "@config/ConnectionConfig";
import { ReactionMessage } from "@messages/ReactionMessage";
import { LocationMessage } from "@messages/LocationMessage";
import { ContactMessage } from "@messages/ContactMessage";
import { ButtonMessage } from "@messages/ButtonMessage";
import { MediaMessage } from "@messages/MediaMessage";
import { VideoMessage } from "@messages/VideoMessage";
import { ImageMessage } from "@messages/ImageMessage";
import UserInterface from "@interfaces/UserInterface";
import { ListMessage } from "@messages/ListMessage";
import WaitCallBack from "@utils/WaitCallBack";
import { StatusTypes } from "../types/Status";
import { Commands } from "@modules/Commands";
import { Message } from "@messages/Message";
import { Command } from "@modules/Command";
import { Emmiter } from "@utils/Emmiter";
import { Status } from "@modules/Status";
import { Chat } from "@modules/Chat";

export default interface BotInterface {
  //? ************** CONFIG **************

  /**
   * * Gerenciador de eventos
   */
  ev: Emmiter;

  /**
   * * Gerenciador de mensagens em promessas
   */
  wcb: WaitCallBack;

  /**
   * * Gerenciador de comandos
   */
  commands: Commands;

  /**
   * * Configurações do bot
   */
  config: ConnectionConfig;

  /**
   * * Status do bot
   */
  status: StatusTypes;

  /**
   * * ID do bot
   */
  id: string;

  //? ************** MODELS **************

  /**
   * * Sala de bate-papo
   * @param id Sala de bate-papo
   */
  Chat(id: string): Chat;

  /**
   * * Usuário
   * @param user Usuário
   */
  User(id: string): UserInterface;

  /**
   * * Status
   * @param status Status
   */
  Status(status: StatusTypes): Status;

  /**
   * * Comando
   */
  Command(): Command;

  /**
   * * Gerenciador de comandos
   */
  Commands(): Commands;

  //? ************** MESSAGE *************

  /**
   * * Mensagem
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   */
  Message(chat: Chat | string, text: string): Message;

  /**
   * * Mensagem com imagem
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   * @param image Imagem
   */
  ImageMessage(chat: Chat | string, text: string, image: Buffer): ImageMessage;

  /**
   * * Mensagem com vídeo
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   * @param video Video
   */
  VideoMessage(chat: Chat | string, text: string, video: Buffer): VideoMessage;

  /**
   * * Mensagem com contatos
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   * @param contact Contato
   */
  ContactMessage(chat: Chat | string, text: string, contact: UserInterface | string): ContactMessage;

  /**
   * * Mensagem com localização
   * @param chat Sala de bate-papo
   * @param longitude Longitude
   * @param latitude Latitude
   */
  LocationMessage(chat: Chat | string, longitude: string, latitude: string): LocationMessage;

  /**
   * * Mensagem com lista
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   */
  ListMessage(chat: Chat | string, text: string): ListMessage;

  /**
   * * Mensagem com botões
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   */
  ButtonMessage(chat: Chat | string, text: string): ButtonMessage;

  /**
   * * Mensagem contendo uma mídia
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   */
  MediaMessage(chat: Chat | string, text: string): MediaMessage;

  /**
   * * Mensagem de reação a uma mensagem
   * @param message
   * @param text
   */
  ReactionMessage(message: Message, text: string): ReactionMessage;

  //? ************ CONNECTION ************

  /**
   * * Conectar bot
   * @param config Configuração do bot
   */
  connect(config: ConnectionConfig): Promise<void>;

  /**
   * * Reconectar bot
   * @param config Configuração do bot
   */
  reconnect(config: ConnectionConfig): Promise<void>;

  /**
   * * Parar bot
   * @param reason Razão por parar bot
   */
  stop(reason: any): Promise<void>;

  //? ************** MESSAGE *************

  /**
   * * Enviar mensagem
   * @param message Mensagem que será enviada
   */
  sendMessage(message: Message): Promise<Message>;

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

  //? ************** STATUS **************

  /**
   * * Enviar status
   * @param status Status que será atualizado
   */
  sendStatus(status: Status): Promise<Status>;

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
  setBotDescription(description: string): Promise<string>;

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
  addChat(chat: Chat): Promise<void>;

  /**
   * * Remove uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  removeChat(chat: string): Promise<void>;

  /**
   * * Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  addUserInChat(chat: string, user: UserInterface | string): Promise<void>;

  /**
   * * Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  removerUserInChat(chat: string, user: UserInterface | string): Promise<void>;

  /**
   * * Cria uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  createChat(chat: Chat): Promise<void>;

  /**
   * * Sai de uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  leaveChat(chat: string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna uma sala de bate-papo
   */
  getChat(chat: string): Promise<Chat | null>;

  /**
   * * Define uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  setChat(chat: Chat): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o nome da sala de bate-papo
   */
  getChatName(user: string): Promise<string>;

  /**
   * @param chat Sala de bate-papo
   * @param name Nome da sala de bate-papo
   */
  setChatName(chat: string, name: string): Promise<string>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a descrição da sala de bate-papo
   */
  getChatDescription(user: string): Promise<string>;

  /**
   * @param chat Sala de bate-papo
   * @param description Descrição da sala de bate-papo
   */
  setChatDescription(chat: string, description: string): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a imagem de perfil da sala de bate-papo
   */
  getChatProfile(user: string): Promise<Buffer>;

  /**
   * @param chat Sala de bate-papo
   * @param profile Imagem de perfil da sala de bate-papo
   */
  setChatProfile(chat: string, profile: Buffer): Promise<void>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os administradores de uma sala de bate-papo
   */
  getChatAdmins(chat: string): Promise<UserInterface[]>;

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o lider da sala de bate-papo
   */
  getChatLeader(chat: string): Promise<UserInterface>;

  /**
   * @returns Retorna as sala de bate-papo que o bot está
   */
  getChats(): Promise<{ [chat: string]: Chat }>;

  /**
   * * Define as salas de bate-papo que o bot está
   * @param chats Salas de bate-papo
   */
  setChats(chats: { [chat: string]: Chat }): Promise<void>;

  //? *************** USER **************

  /**
   * * Adiciona um novo usuário
   * @param user Usuário
   */
  addUser(user: UserInterface): Promise<void>;

  /**
   * * Remove um usuário
   * @param user Usuário
   */
  removeUser(user: string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna um usuário
   */
  getUser(user: string): Promise<UserInterface | null>;

  /**
   * * Define um usuário
   * @param user Usuário
   */
  setUser(user: UserInterface): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna o nome do usuário
   */
  getUserName(user: string): Promise<string>;

  /**
   * @param user Usuário
   * @param name Nome do usuário
   */
  setUserName(user: string, name: string): Promise<string>;

  /**
   * @param user Usuário
   * @returns Retorna a descrição do usuário
   */
  getUserDescription(user: string): Promise<string>;

  /**
   * @param user Usuário
   * @param description Descrição do usuário
   */
  setUserDescription(user: string, description: string): Promise<void>;

  /**
   * @param user Usuário
   * @returns Retorna a foto de perfil do usuário
   */
  getUserProfile(user: string): Promise<Buffer>;

  /**
   * @param user Usuário
   * @param profile Imagem de perfil do usuário
   */
  setUserProfile(user: string, profile: Buffer): Promise<void>;

  /**
   * * Desbloqueia um usuário
   * @param user Usuário
   */
  unblockUser(user: string): Promise<void>;

  /**
   * * Bloqueia um usuário
   * @param user Usuário
   */
  blockUser(user: string): Promise<void>;

  /**
   * @returns Retorna a lista de usuários do bot
   */
  getUsers(): Promise<{ [user: string]: UserInterface }>;

  /**
   * * Define a lista de usuários do bot
   * @param users Usuários
   */
  setUsers(users: { [user: string]: UserInterface }): Promise<void>;
}
