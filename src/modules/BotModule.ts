import { ConnectionConfig, DefaultConnectionConfig } from "@config/ConnectionConfig";

import { MessageInterface } from "@interfaces/MessagesInterfaces";
import CommandInterface from "@interfaces/CommandInterface";
import ChatInterface from "@interfaces/ChatInterface";
import UserInterface from "@interfaces/UserInterface";
import BotInterface from "@interfaces/BotInterface";
import Auth from "@interfaces/Auth";

import LocationMessage from "@messages/LocationMessage";
import ContactMessage from "@messages/ContactMessage";
import ButtonMessage from "@messages/ButtonMessage";
import MediaMessage from "@messages/MediaMessage";
import VideoMessage from "@messages/VideoMessage";
import ImageMessage from "@messages/ImageMessage";
import ListMessage from "@messages/ListMessage";
import Message from "@messages/Message";

import UserModule from "@modules/User";
import Chat from "@modules/Chat";
import User from "@modules/User";

import PromiseMessages from "@utils/PromiseMessages";
import { setBotProperty } from "@utils/bot";
import { getError } from "@utils/error";
import Emmiter from "@utils/Emmiter";
import sleep from "@utils/sleep";

import { Chats, ChatStatus } from "../types/Chat";
import { Users } from "../types/User";
import AudioMessage from "@messages/AudioMessage";

export default class BotModule<Bot extends BotInterface, Command extends CommandInterface> extends Emmiter {
  private bot: Bot;

  private autoMessages: any = {};
  private promiseMessages: PromiseMessages = new PromiseMessages();

  public config: ConnectionConfig;
  public commands: { [tag: string]: Command } = {};

  get id() {
    return this.bot.id;
  }

  constructor(bot: Bot, config?: ConnectionConfig) {
    super();

    this.bot = bot;

    this.config = config || DefaultConnectionConfig;

    this.configEvents();
  }

  /** * Configura os eventos */
  public configEvents() {
    this.bot?.ev.on("message", (message: Message) => {
      try {
        if (this.promiseMessages.resolvePromiseMessages(message)) return;

        if (message.fromMe && this.config.disableAutoCommand) return;
        if (this.config.disableAutoCommand) return;

        this.config.commandConfig.get(message.text, this.commands)?.execute(message);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot?.ev.on("me", (message: Message) => {
      try {
        if (this.promiseMessages.resolvePromiseMessages(message)) return;

        if (this.config.disableAutoCommand || this.config.receiveAllMessages) return;

        this.getCommand(message.text)?.execute(message);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });
  }

  /**
   * * Conectar bot
   * @param auth Autenticação do bot
   */
  public connect(auth: Auth | string) {
    return this.bot.connect(auth);
  }

  /**
   * * Reconectar bot
   * @param alert Alerta que está reconectando
   */
  public reconnect(alert?: boolean) {
    return this.bot.reconnect(alert);
  }

  /**
   * * Parar bot
   * @param reason Razão por parar bot
   */
  public stop(reason: any) {
    return this.bot.stop(reason);
  }

  /**
   * * Adiciona uma reação na mensagem
   * @param message Mensagem que será reagida
   * @param reaction Reação
   */
  public addReaction(message: MessageInterface, reaction: string): Promise<void> {
    return this.bot.addReaction(Message.Inject(this, message), reaction);
  }

  /**
   * * Remove a reação da mensagem
   * @param message Mensagem que terá sua reação removida
   */
  public removeReaction(message: MessageInterface): Promise<void> {
    return this.bot.removeReaction(Message.Inject(this, message));
  }

  /**
   * * Deletar mensagem
   * @param message Mensagem que será deletada da sala de bate-papos
   */
  public deleteMessage(message: MessageInterface): Promise<void> {
    return this.bot.removeMessage(Message.Inject(this, message));
  }

  /**
   * * Remover mensagem
   * @param message Mensagem que será removida da sala de bate-papo
   */
  public removeMessage(message: MessageInterface): Promise<void> {
    return this.bot.removeMessage(Message.Inject(this, message));
  }

  /**
   * * Marca uma mensagem como visualizada
   * @param message Mensagem que será visualizada
   */
  readMessage(message: MessageInterface): Promise<void>;

  public async readMessage(message: MessageInterface) {
    return this.bot.readMessage(message);
  }

  /**
   * * Envia um conteúdo
   * @param content
   * @returns Retorna o conteudo enviado
   */
  public async send(message: MessageInterface): Promise<Message> {
    try {
      return Message.Inject(this, await this.bot.send(message));
    } catch (err) {
      this.emit("error", getError(err));
    }

    return Message.Inject(this, message);
  }

  /**
   * * Aguarda uma mensagem ser recebida em uma sala de bate-papo
   * @param chatId Sala de bate-papo que irá receber a mensagem
   * @param ignoreMessageFromMe Ignora a mensagem se quem enviou foi o próprio bot
   * @param stopRead Para de ler a mensagem no evento
   * @param ignoreMessages Não resolve a promessa se a mensagem recebida é a mesma escolhida
   */
  awaitMessage(chat: ChatInterface | string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: Message[]): Promise<Message> {
    return this.promiseMessages.addPromiseMessage(Chat.getChatId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages);
  }

  /**
   * * Automotiza uma mensagem
   * @param message
   * @param timeout
   * @param chats
   * @param id
   * @returns
   */
  public async addAutomate(message: Message, timeout: number, chats?: { [key: string]: Chat }, id: string = String(Date.now())): Promise<any> {
    try {
      const now = Date.now();

      // Criar e atualizar dados da mensagem automatizada
      this.autoMessages[id] = { id, chats: chats || (await this.getChats()), updatedAt: now, message };

      // Aguarda o tempo definido
      await sleep(timeout - now);

      // Cancelar se estiver desatualizado
      if (this.autoMessages[id].updatedAt !== now) return;

      await Promise.all(
        this.autoMessages[id].chats.map(async (chat: Chat) => {
          const automated: any = this.autoMessages[id];

          if (automated.updatedAt !== now) return;

          automated.message?.setChat(chat);

          // Enviar mensagem
          await this.send(automated.message);

          // Remover sala de bate-papo da mensagem
          const nowChats = automated.chats;
          const index = nowChats.indexOf(automated.chats[chat.id]);
          this.autoMessages[id].chats = nowChats.splice(index + 1, nowChats.length);
        })
      );
    } catch (err) {
      this.emit("error", getError(err));
    }
  }

  /**
   * * Define os comandos do bot
   * @param commands Comandos que será injetado
   */
  public setCommands(commands: { [k: string]: Command } | Command[]) {
    if (Array.isArray(commands)) {
    } else {
      for (const k in commands) {
        const cmd = commands[k];

        this.commands[cmd.tags.join(" ")] = cmd;
      }
    }
  }

  /**
   * @returns Retorna os comandos do bot
   */
  public getCommands() {
    return this.commands;
  }

  /**
   * * Define um comando na lista de comandos
   * @param command Comando que será definido
   */
  public setCommand(command: Command) {
    this.commands[command.tags.join(" ")] = command;
  }

  /**
   * @param command Comando que será procurado
   * @param args Argumentos que serão usados na construção do comando
   * @returns Retorna um comando do bot
   */
  public getCommand(command: string): Command | null {
    const cmd = this.config.commandConfig?.get(command, this.commands);

    if (!cmd) return null;

    setBotProperty(this, cmd);

    //@ts-ignore
    return cmd;
  }

  //! <==============================> CHAT <==============================>

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna uma sala de bate-papo
   */
  public async getChat(chat: ChatInterface | string): Promise<Chat | null> {
    const chatInterface = await this.bot.getChat(Chat.getChat(chat));

    if (!chatInterface) return null;

    return Chat.Inject(this, chatInterface);
  }

  /**
   * * Define uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public async setChat(chat: ChatInterface) {
    this.bot.setChat(Chat.Inject(this, chat));
  }

  /**
   * @returns Retorna as sala de bate-papo que o bot está
   */
  public async getChats(): Promise<Chats> {
    const modules: Chats = {};

    const chats = await this.bot.getChats();

    for (const id in chats) {
      modules[id] = Chat.Inject(this, chats[id]);
    }

    return modules;
  }

  /**
   * * Define as salas de bate-papo que o bot está
   * @param chats Salas de bate-papo
   */
  public async setChats(chats: Chats): Promise<void> {
    return this.bot.setChats(chats);
  }

  /**
   * * Adiciona uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public addChat(chat: string | ChatInterface): Promise<void> {
    return this.bot.addChat(Chat.Inject(this, Chat.getChat(chat)));
  }

  /**
   * * Remove uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public removeChat(chat: string | ChatInterface): Promise<void> {
    return this.bot.removeChat(Chat.Inject(this, Chat.getChat(chat)));
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o nome da sala de bate-papo
   */
  public getChatName(chat: ChatInterface | string) {
    return this.bot.getChatName(Chat.getChat(chat));
  }

  /**
   * @param chat Sala de bate-papo
   * @param name Nome da sala de bate-papo
   */
  public setChatName(chat: ChatInterface | string, name: string) {
    return this.bot.setChatName(Chat.getChat(chat), name);
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a descrição da sala de bate-papo
   */
  public getChatDescription(chat: ChatInterface | string) {
    return this.bot.getChatDescription(Chat.getChat(chat));
  }

  /**
   * @param chat Sala de bate-papo
   * @param description Descrição da sala de bate-papo
   */
  public setChatDescription(chat: ChatInterface | string, description: string) {
    return this.bot.setChatDescription(Chat.getChat(chat), description);
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a imagem de perfil da sala de bate-papo
   */
  public getChatProfile(chat: ChatInterface | string) {
    return this.bot.getChatProfile(Chat.getChat(chat));
  }

  /**
   * @param chat Sala de bate-papo
   * @param profile Imagem de perfil da sala de bate-papo
   */

  public setChatProfile(chat: ChatInterface | string, profile: Buffer) {
    return this.bot.setChatProfile(Chat.getChat(chat), profile);
  }

  /**
   * * Altera o status da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param status Status da sala de bate-papo
   */
  public async changeChatStatus(chat: string | ChatInterface, status: ChatStatus): Promise<void> {
    return this.bot.changeChatStatus(Chat.Inject(this, Chat.getChat(chat)), status);
  }

  /**
   * * Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public addUserInChat(chat: ChatInterface | string, user: UserInterface | string) {
    return this.bot.addUserInChat(Chat.getChat(chat), User.getUser(user));
  }

  /**
   * * Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public removeUserInChat(chat: ChatInterface | string, user: UserInterface | string) {
    return this.bot.removeUserInChat(Chat.getChat(chat), User.getUser(user));
  }

  /**
   * * Promove há administrador um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public promoteUserInChat(chat: ChatInterface | string, user: UserInterface | string) {
    return this.bot.promoteUserInChat(Chat.getChat(chat), User.getUser(user));
  }

  /**
   * * Remove a administração um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public demoteUserInChat(chat: ChatInterface | string, user: UserInterface) {
    return this.bot.demoteUserInChat(Chat.getChat(chat), User.getUser(user));
  }

  /**
   * * Cria uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public createChat(chat: ChatInterface) {
    return this.bot.createChat(Chat.getChat(chat));
  }

  /**
   * * Sai de uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public leaveChat(chat: ChatInterface | string) {
    return this.bot.leaveChat(Chat.getChat(chat));
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os administradores de uma sala de bate-papo
   */
  public async getChatAdmins(chat: ChatInterface | string) {
    const admins = await this.bot.getChatAdmins(Chat.getChat(chat));

    const adminModules: Users = {};

    Object.keys(admins).forEach((id) => {
      adminModules[id] = User.Inject(this, admins[id]);
    });

    return adminModules;
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o lider da sala de bate-papo
   */
  public async getChatLeader(chat: Chat | string): Promise<User> {
    const leader = await this.bot.getChatLeader(Chat.getChat(chat));

    return User.Inject(this, leader);
  }

  //! <==============================> USER <==============================>

  /**
   * @param user Usuário
   * @returns Retorna um usuário
   */
  public async getUser(user: string): Promise<UserModule | null> {
    const usr = await this.bot.getUser(User.getUser(user));

    if (usr) return UserModule.Inject(this, usr);

    return null;
  }

  /**
   * * Define um usuário
   * @param user Usuário
   */
  public async setUser(user: string | UserInterface): Promise<void> {
    return this.bot.setUser(User.Inject(this, User.getUser(user)));
  }

  /**
   * @returns Retorna a lista de usuários do bot
   */
  public async getUsers(): Promise<Users> {
    const modules: Users = {};

    const users = await this.bot.getUsers();

    for (const id in users) {
      modules[id] = User.Inject(this, users[id]);
    }

    return modules;
  }

  /**
   * * Define a lista de usuários do bot
   * @param users Usuários
   */
  public setUsers(users: Users): Promise<void> {
    return this.bot.setUsers(users);
  }

  /**
   * * Adiciona um novo usuário
   * @param user Usuário
   */
  public async addUser(user: string | UserInterface): Promise<void> {
    return this.bot.addUser(User.Inject(this, User.getUser(user)));
  }

  /**
   * * Remove um usuário
   * @param user Usuário
   */
  public removeUser(user: UserInterface | string) {
    return this.bot.removeUser(User.getUser(user));
  }

  /**
   * @param user Usuário
   * @returns Retorna o nome do usuário
   */
  public getUserName(user: UserInterface | string) {
    if (User.getUserId(user) == this.id) return this.getBotName();

    return this.bot.getUserName(User.getUser(user));
  }

  /**
   * @param user Usuário
   * @param name Nome do usuário
   */
  public setUserName(user: UserInterface | string, name: string) {
    if (User.getUserId(user) == this.id) return this.setBotName(name);

    return this.bot.setUserName(User.getUser(user), name);
  }

  /**
   * @param user Usuário
   * @returns Retorna a descrição do usuário
   */
  public getUserDescription(user: UserInterface | string) {
    if (User.getUserId(user) == this.id) return this.getBotDescription();

    return this.bot.getUserDescription(User.getUser(user));
  }

  /**
   * @param user Usuário
   * @param description Descrição do usuário
   */
  public setUserDescription(user: UserInterface | string, description: string) {
    if (User.getUserId(user) == this.id) return this.setBotDescription(description);

    return this.bot.setUserDescription(User.getUser(user), description);
  }

  /**
   * @param user Usuário
   * @returns Retorna a foto de perfil do usuário
   */
  public getUserProfile(user: UserInterface | string) {
    if (User.getUserId(user) == this.id) return this.getBotProfile();

    return this.bot.getUserProfile(User.getUser(user));
  }

  /**
   * @param user Usuário
   * @param profile Imagem de perfil do usuário
   */
  public setUserProfile(user: UserInterface | string, profile: Buffer) {
    if (User.getUserId(user) == this.id) return this.setBotProfile(profile);

    return this.bot.setUserProfile(User.getUser(user), profile);
  }

  /**
   * * Desbloqueia um usuário
   * @param user Usuário
   */
  public unblockUser(user: UserInterface | string) {
    return this.bot.unblockUser(User.getUser(user));
  }

  /**
   * * Bloqueia um usuário
   * @param user Usuário
   */
  public blockUser(user: UserInterface | string) {
    return this.bot.blockUser(User.getUser(user));
  }

  //! <===============================> BOT <==============================>

  /**
   * @returns Retorna o nome do bot
   */
  public getBotName() {
    return this.bot.getBotName();
  }

  /**
   * * Define o nome do bot
   * @param name Nome do bot
   */
  public setBotName(name: string) {
    return this.bot.setBotName(name);
  }

  /**
   * @returns Retorna a descrição do bot
   */
  public getBotDescription() {
    return this.bot.getBotDescription();
  }

  /**
   * * Define a descrição do bot
   * @param description Descrição do bot
   */
  public setBotDescription(description: string) {
    return this.bot.setBotDescription(description);
  }

  /**
   * @returns Retorna foto de perfil do bot
   */
  public getBotProfile() {
    return this.bot.getBotProfile();
  }

  /**
   * * Define foto de perfil do bot
   * @param image Foto de perfil do bot
   */
  public setBotProfile(profile: Buffer) {
    return this.bot.setBotProfile(profile);
  }

  //! <=============================> MODULES <=============================>

  /**
   * * Sala de bate-papo
   * @param id Sala de bate-papo
   */
  Chat(chat: Chat | string): Chat {
    return Chat.Inject(this, this.bot.Chat(Chat.getChat(chat)));
  }

  /**
   * * Usuário
   * @param user Usuário
   */
  User(user: UserInterface | string): User {
    return User.Inject(this, this.bot.User(User.getUser(user)));
  }

  /**
   * * Mensagem
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   */
  Message(chat: ChatInterface | string, text: string): Message {
    return Message.Inject(this, this.bot.Message(this.Chat(chat), text));
  }

  /**
   * * Mensagem contendo uma mídia
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   */
  MediaMessage(chat: ChatInterface | string, text: string, file: any): MediaMessage {
    return MediaMessage.Inject(this, this.bot.MediaMessage(this.Chat(chat), text, file));
  }

  /**
   * * Mensagem com imagem
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   * @param image Imagem
   */
  ImageMessage(chat: ChatInterface | string, text: string, image: Buffer): ImageMessage {
    return ImageMessage.Inject(this, this.bot.ImageMessage(this.Chat(chat), text, image));
  }

  /**
   * * Mensagem com vídeo
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   * @param video Video
   */
  VideoMessage(chat: ChatInterface | string, text: string, video: Buffer): VideoMessage {
    return VideoMessage.Inject(this, this.bot.VideoMessage(this.Chat(chat), text, video));
  }

  /**
   * * Mensagem com audio
   * @param chat Sala de bate-papo
   * @param audio Audio
   */
  AudioMessage(chat: ChatInterface | string, audio: Buffer): AudioMessage {
    return AudioMessage.Inject(this, this.bot.AudioMessage(this.Chat(chat), audio));
  }

  /**
   * * Mensagem com contatos
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   * @param contact Contato
   */
  ContactMessage(chat: ChatInterface | string, text: string, contact: string | string[]): ContactMessage {
    return ContactMessage.Inject(this, this.bot.ContactMessage(this.Chat(chat), text, contact));
  }

  /**
   * * Mensagem com localização
   * @param chat Sala de bate-papo
   * @param longitude Longitude
   * @param latitude Latitude
   */
  LocationMessage(chat: ChatInterface | string, latitude: number, longitude: number): LocationMessage {
    return LocationMessage.Inject(this, this.bot.LocationMessage(this.Chat(chat), longitude, latitude));
  }

  /**
   * * Mensagem com lista
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   */
  ListMessage(chat: ChatInterface | string, text: string, button: string): ListMessage {
    return ListMessage.Inject(this, this.bot.ListMessage(this.Chat(chat), text, button));
  }

  /**
   * * Mensagem com botões
   * @param chat Sala de bate-papo
   * @param text Texto da mensagem
   */
  ButtonMessage(chat: ChatInterface | string, text: string): ButtonMessage {
    return ButtonMessage.Inject(this, this.bot.ButtonMessage(this.Chat(chat), text));
  }
}

export function BuildBot<Bot extends BotInterface, Command extends CommandInterface>(bot: Bot, config?: ConnectionConfig) {
  return new BotModule<Bot, Command>(bot, config);
}
