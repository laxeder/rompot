import { readFileSync } from "fs";

import { DEFAULT_CONNECTION_CONFIG } from "../configs/Defaults";
import ConnectionConfig from "../configs/ConnectionConfig";

import MessageHandler, { MessageHandlerConfig } from "../utils/MessageHandler";
import CommandController from "../command/CommandController";
import ReactionMessage from "../messages/ReactionMessage";
import { CMDRunType } from "../command/CommandEnums";
import ErrorMessage from "../messages/ErrorMessage";
import MediaMessage from "../messages/MediaMessage";
import { sleep, getError } from "../utils/Generic";
import { ChatStatus } from "../chat/ChatStatus";
import ClientEvents from "./ClientEvents";
import Message from "../messages/Message";
import Command from "../command/Command";
import BotBase from "../bot/BotBase";
import Chat from "../chat/Chat";
import User from "../user/User";
import IBot from "../bot/IBot";
import IAuth from "./IAuth";

export default class Client<Bot extends IBot> extends ClientEvents {
  /** Tratador de mensagens */
  public messageHandler: MessageHandler = new MessageHandler();
  /** Controlador de comandos  */
  public commandController: CommandController = new CommandController();
  /** Configuração */
  public config: ConnectionConfig;
  /** Bot */
  public bot: Bot;
  /** Vezes que o bot reconectou */
  public reconnectTimes: number = 0;
  /** Id do cliente */
  public id: string;

  constructor(bot: Bot, config: Partial<ConnectionConfig> = {}) {
    super();

    this.bot = bot;

    this.id = Client.generateId();

    this.config = { ...DEFAULT_CONNECTION_CONFIG, ...config };

    this.configEvents();
  }

  /** Configura os eventos do cliente */
  public configEvents() {
    this.bot.on("message", async (message: Message) => {
      try {
        message.setBotId(this.id);

        if (!message.fromMe && !this.config.disableAutoRead) await this.readMessage(message);
        if (this.messageHandler.resolveMessage(message)) return;

        this.emit("message", message);

        if (this.config.disableAutoCommand) return;
        if (this.config.disableAutoCommandForUnofficialMessage && message.isUnofficial) return;

        const command = this.searchCommand(message.text);

        if (command != null) {
          this.runCommand(command, message, CMDRunType.Exec);
        }
      } catch (err) {
        this.emit("message", new ErrorMessage(message.chat, err));
      }
    });

    this.bot.on("open", (update) => {
      try {
        this.reconnectTimes = 0;

        Client.saveClient(this);

        this.emit("open", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("reconnecting", (update) => {
      try {
        this.emit("reconnecting", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("connecting", (update) => {
      try {
        this.emit("connecting", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("close", async (update) => {
      try {
        this.emit("close", update);

        if (this.reconnectTimes < this.config.maxReconnectTimes) {
          this.reconnectTimes++;

          await sleep(this.config.reconnectTimeout);

          this.reconnect();
        }
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("stop", async (update) => {
      try {
        this.emit("stop", update);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("qr", (qr) => {
      try {
        this.emit("qr", qr);
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("user", (update) => {
      try {
        this.emit("user", {
          event: update.event,
          action: update.action,
          chat: Chat.get(update.chat, this.id),
          user: User.get(update.user, this.id),
          fromUser: User.get(update.fromUser, this.id),
        });
      } catch (err) {
        this.emit("error", getError(err));
      }
    });

    this.bot.on("error", (err) => {
      try {
        this.emit("error", getError(err));
      } catch (err) {
        this.emit("error", getError(err));
      }
    });
  }

  /** Conectar bot
   * @param auth Autenticação do bot
   */
  public async connect(auth: IAuth | string) {
    await this.bot.connect(auth);
  }

  /**
   * Conectar bot pelo código
   * @param phoneNumber Número do bot
   * @param auth Autenticação do bot
   */
  public async connectByCode(phoneNumber: number | string, auth: string | IAuth): Promise<string> {
    return await this.bot.connectByCode(String(phoneNumber).replace(/\D+/g, ""), auth);
  }

  /** Reconectar bot
   * @param alert Alerta que está reconectando
   */
  public async reconnect(alert?: boolean) {
    await this.bot.reconnect(alert);
  }

  /** Parar bot
   * @param reason Razão por parar bot
   */
  public stop(reason?: any) {
    return this.bot.stop(reason);
  }

  /**
   * Desconecta o bot
   */
  public async logout(): Promise<void> {
    await this.bot.logout();
  }

  /** @returns Controlador de comando do cliente */
  public getCommandController(): CommandController {
    if (this.commandController.botId != this.id) {
      this.commandController.botId = this.id;
    }

    return this.commandController;
  }

  /** Define o controlador de comando do cliente */
  public setCommandController(controller: CommandController): void {
    controller.botId = this.id;

    this.commandController = controller;
  }

  /** Define os comandos do bot
   * @param commands Comandos que será injetado
   */
  public setCommands(commands: Command[]) {
    this.commandController.setCommands(commands);
  }

  /** @returns Retorna os comandos do bot */
  public getCommands() {
    return this.commandController.getCommands();
  }

  /** Adiciona um comando na lista de comandos
   * @param command Comando que será adicionado
   */
  public addCommand(command: Command): void {
    this.commandController.addCommand(command);
  }

  /** Remove um comando na lista de comandos
   * @param command Comando que será removido
   */
  public removeCommand(command: Command): boolean {
    return this.commandController.removeCommand(command);
  }

  /**
   * Procura um comando no texto.
   * @param text - Texto que contem o comando.
   * */
  public searchCommand(text: string): Command | null {
    const command = this.commandController.searchCommand(text);

    if (command == null) return null;

    command.botId = this.id;

    return command;
  }

  /**
   * Execução do comando.
   * @param command - Comando que será executado.
   * @param message - Mensagem associada ao comando.
   */
  public runCommand(command: Command, message: Message, type?: string) {
    return this.commandController.runCommand(command, message, type);
  }

  /**
   * Deletar mensagem
   * @param message Mensagem que será deletada da sala de bate-papos
   */
  public deleteMessage(message: Message): Promise<void> {
    return this.bot.deleteMessage(message);
  }

  /** Remover mensagem
   * @param message Mensagem que será removida da sala de bate-papo
   */
  public removeMessage(message: Message): Promise<void> {
    return this.bot.removeMessage(message);
  }

  /** Marca uma mensagem como visualizada
   * @param message Mensagem que será visualizada
   */
  public readMessage(message: Message): Promise<void> {
    return this.bot.readMessage(message);
  }

  /** Edita o texto de uma mensagem enviada
   * @param message Mensagem que será editada
   * @param text Novo texto da mensagem
   */
  public editMessage(message: Message, text: string): Promise<void> {
    message.text = text;
    message.isEdited = true;

    return this.bot.editMessage(message);
  }

  /** Adiciona uma reação na mensagem
   * @param message Mensagem
   * @param reaction Reação
   */
  public addReaction(message: Message, reaction: string): Promise<void> {
    return this.bot.addReaction(new ReactionMessage(message.chat, reaction, message, { user: message.user }));
  }

  /** Remove a reação da mensagem
   * @param message Mensagem que terá sua reação removida
   */
  public removeReaction(message: Message): Promise<void> {
    return this.bot.removeReaction(new ReactionMessage(message.chat, "", message, { user: message.user }));
  }

  /** Adiciona animações na reação da mensagem
   * @param message Mensagem que receberá a animação
   * @param reactions Reações em sequência
   * @param interval Intervalo entre cada reação
   * @param maxTimeout Maximo de tempo reagindo
   */
  public addAnimatedReaction(message: Message, reactions: string[], interval: number = 2000, maxTimeout: number = 60000): (reactionStop?: string) => Promise<void> {
    var isStoped: boolean = false;
    const now = Date.now();

    const stop = async (reactionStop?: string) => {
      if (isStoped) return;

      isStoped = true;

      if (!!!reactionStop) {
        await this.removeReaction(message);
      } else {
        await this.addReaction(message, reactionStop);
      }
    };

    const addReaction = async (index: number) => {
      if (isStoped || now + maxTimeout < Date.now()) {
        return stop();
      }

      if (reactions[index]) {
        await this.addReaction(message, reactions[index]);
      }

      await sleep(interval);

      addReaction(index + 1 >= reactions.length ? 0 : index + 1);
    };

    addReaction(0);

    return stop;
  }

  /** Envia uma mensagem
   * @param message Menssagem que será enviada
   * @returns Retorna o conteudo enviado
   */
  public async send(message: Message): Promise<Message> {
    if (!this.config.disableAutoTyping) {
      await this.changeChatStatus(message.chat, ChatStatus.Typing);
    }

    return Message.get(await this.bot.send(message), this.id);
  }

  /** Envia uma mensagem
   * @param chat Sala de bate-papo onde irá ser enviado a mensagem
   * @param message Mensagem que será enviada
   * @param mention Mensagem que será mencionada
   */
  public async sendMessage(chat: Chat | string, message: string | Message, mention?: Message): Promise<Message> {
    if (Message.isValid(message)) {
      message = Message.get(message, this.id);
      message.chat = Chat.get(chat, this.id);
      message.mention = mention;

      return await this.send(message);
    }

    return await this.send(new Message(chat, message, { mention }));
  }

  /** Aguarda uma mensagem ser recebida em uma sala de bate-papo
   * @param chat Sala de bate-papo que irá receber a mensagem
   * @param config Configuração do aguardo da mensagem
   */
  public async awaitMessage(chat: Chat | string, config: Partial<MessageHandlerConfig> = {}): Promise<Message> {
    return Message.get(await this.messageHandler.addMessage(Chat.getId(chat), config), this.id);
  }

  /**
   * Retorna a stream da mídia
   * @param message Mídia que será baixada
   * @returns Stream da mídia
   */
  public async downloadStreamMessage(message: MediaMessage): Promise<Buffer> {
    if (!message.file) return Buffer.from("");

    if (Buffer.isBuffer(message.file)) return message.file;

    if (typeof message.file == "string") {
      return readFileSync(message.file);
    }

    return this.bot.downloadStreamMessage(message.file);
  }

  /** @returns Retorna o nome do bot */
  public getBotName(): Promise<string> {
    return this.bot.getBotName();
  }

  /** Define o nome do bot
   * @param name Nome do bot
   */
  public setBotName(name: string) {
    return this.bot.setBotName(name);
  }

  /** @returns Retorna a descrição do bot */
  public getBotDescription() {
    return this.bot.getBotDescription();
  }

  /** Define a descrição do bot
   * @param description Descrição do bot
   */
  public setBotDescription(description: string) {
    return this.bot.setBotDescription(description);
  }

  /** @returns Retorna foto de perfil do bot */
  public getBotProfile(lowQuality?: boolean) {
    return this.bot.getBotProfile(lowQuality);
  }

  /** Define a imagem de perfil do bot
   * @param image Imagem de perfil do bot
   */
  public setBotProfile(profile: Buffer) {
    return this.bot.setBotProfile(profile);
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna uma sala de bate-papo
   */
  public async getChat(chat: Chat | string): Promise<Chat | null> {
    const chatData = await this.bot.getChat(Chat.get(chat));

    if (chatData == null) return null;

    return Chat.get(chatData, this.id);
  }

  /**
   * Atualiza os dados de um chat.
   * @param id - Id do chat que será atualizado.
   * @param chat - Dados do chat que será atualizado.
   */
  public updateChat(id: string, chat: Partial<Chat>): Promise<void> {
    return this.bot.updateChat({ ...chat, id });
  }

  /** @returns Retorna as sala de bate-papo que o bot está */
  public async getChats(): Promise<Chat[]> {
    const ids: string[] = await this.bot.getChats();
    const chats: Chat[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const chat = await this.bot.getChat(new Chat(id));

        if (chat == null) return;

        chats.push(Chat.get(chat, this.id));
      })
    );

    return chats;
  }

  /** Define as salas de bate-papo que o bot está
   * @param chats Salas de bate-papo
   */
  public setChats(chats: Chat[]): Promise<void> {
    return this.bot.setChats(chats);
  }

  /** Remove uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public removeChat(chat: string | Chat): Promise<void> {
    return this.bot.removeChat(Chat.get(chat, this.id));
  }

  /** Cria uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public createChat(chat: Chat) {
    return this.bot.createChat(Chat.get(chat, this.id));
  }

  /** Sai de uma sala de bate-papo
   * @param chat Sala de bate-papo
   */
  public leaveChat(chat: Chat | string) {
    return this.bot.leaveChat(Chat.get(chat, this.id));
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o nome da sala de bate-papo
   */
  public getChatName(chat: Chat | string) {
    return this.bot.getChatName(Chat.get(chat, this.id));
  }

  /** Define o nome da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param name Nome da sala de bate-papo
   */
  public setChatName(chat: Chat | string, name: string) {
    return this.bot.setChatName(Chat.get(chat, this.id), name);
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a descrição da sala de bate-papo
   */
  public getChatDescription(chat: Chat | string) {
    return this.bot.getChatDescription(Chat.get(chat, this.id));
  }

  /** Define a descrição da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param description Descrição da sala de bate-papo
   */
  public setChatDescription(chat: Chat | string, description: string) {
    return this.bot.setChatDescription(Chat.get(chat, this.id), description);
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna a imagem de perfil da sala de bate-papo
   */
  public getChatProfile(chat: Chat | string, lowQuality?: boolean) {
    return this.bot.getChatProfile(Chat.get(chat, this.id), lowQuality);
  }

  /** Define a imagem de perfil da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param profile Imagem de perfil da sala de bate-papo
   */
  public setChatProfile(chat: Chat | string, profile: Buffer) {
    return this.bot.setChatProfile(Chat.get(chat, this.id), profile);
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna o lider da sala de bate-papo
   */
  public async getChatLeader(chat: Chat | string): Promise<User> {
    return User.get(await this.bot.getChatLeader(Chat.get(chat, this.id)), this.id);
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os usuários de uma sala de bate-papo
   */
  public async getChatUsers(chat: Chat | string): Promise<string[]> {
    return await this.bot.getChatUsers(Chat.get(chat, this.id));
  }

  /**
   * @param chat Sala de bate-papo
   * @returns Retorna os administradores de uma sala de bate-papo
   */
  public async getChatAdmins(chat: Chat | string): Promise<string[]> {
    return await this.bot.getChatAdmins(Chat.get(chat, this.id));
  }

  /** Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public addUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.addUserInChat(Chat.get(chat, this.id), User.get(user, this.id));
  }

  /** Adiciona um novo usuário a uma sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public removeUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.removeUserInChat(Chat.get(chat, this.id), User.get(user, this.id));
  }

  /** Promove há administrador um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public promoteUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.promoteUserInChat(Chat.get(chat, this.id), User.get(user, this.id));
  }

  /** Remove a administração um usuário da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param user Usuário
   */
  public demoteUserInChat(chat: Chat | string, user: User | string) {
    return this.bot.demoteUserInChat(Chat.get(chat, this.id), User.get(user, this.id));
  }

  /** Altera o status da sala de bate-papo
   * @param chat Sala de bate-papo
   * @param status Status da sala de bate-papo
   */
  public changeChatStatus(chat: Chat | string, status: ChatStatus): Promise<void> {
    return this.bot.changeChatStatus(Chat.get(chat, this.id), status);
  }

  /**
   * Entra no chat pelo código de convite.
   * @param code - Código de convite do chat.
   */
  public joinChat(code: string): Promise<void> {
    return this.bot.joinChat(code);
  }

  /**
   * Obtem o código de convite do chat.
   * @param chat - Chat que será obtido o código de convite.
   * @returns O código de convite do chat.
   */
  public getChatEnvite(chat: Chat | string): Promise<string> {
    return this.bot.getChatEnvite(Chat.get(chat, this.id));
  }

  /**
   * Revoga o código de convite do chat.
   * @param chat - Chat que terá seu código de convite revogado.
   * @returns O novo código de convite do chat.
   */
  public revokeChatEnvite(chat: Chat | string): Promise<string> {
    return this.bot.revokeChatEnvite(Chat.get(chat, this.id));
  }

  /** @returns Retorna a lista de usuários do bot */
  public async getUsers(): Promise<User[]> {
    const ids: string[] = await this.bot.getUsers();
    const users: User[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const user = await this.bot.getUser(new User(id));

        if (user == null) return;

        users.push(User.get(user, this.id));
      })
    );

    return users;
  }

  /**
   * Obter lista de usuários salvos.
   * @returns Lista de usuários salvos.
   */
  public async getSavedUsers(): Promise<User[]> {
    const ids: string[] = await this.bot.getUsers();
    const users: User[] = [];

    await Promise.all(
      ids.map(async (id) => {
        const user = await this.bot.getUser(new User(id));

        if (user == null || !user.savedName) return;

        users.push(User.get(user, this.id));
      })
    );

    return users;
  }

  /** Define a lista de usuários do bot
   * @param users Usuários
   */
  public setUsers(users: User[]) {
    return this.bot.setUsers(users);
  }

  /**
   * @param user Usuário
   * @returns Retorna um usuário
   */
  public async getUser(user: User | string): Promise<User | null> {
    const userData = await this.bot.getUser(User.get(user, this.id));

    if (userData == null) return null;

    return User.get(userData, this.id);
  }

  /**
   * Atualiza os dados de um usuário.
   * @param id - Id do usuário que será atualizado.
   * @param user - Dados do usuário que será atualizado.
   */
  public updateUser(id: string, user: Partial<User>): Promise<void> {
    return this.bot.updateUser({ ...user, id });
  }

  /** Remove um usuário
   * @param user Usuário
   */
  public removeUser(user: User | string) {
    return this.bot.removeUser(User.get(user, this.id));
  }

  /**
   * @param user Usuário
   * @returns Retorna o nome do usuário
   */
  public getUserName(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotName();

    return this.bot.getUserName(User.get(user, this.id));
  }

  /** Define o nome do usuário
   * @param user Usuário
   * @param name Nome do usuário
   */
  public setUserName(user: User | string, name: string) {
    if (User.getId(user) == this.id) return this.setBotName(name);

    return this.bot.setUserName(User.get(user, this.id), name);
  }

  /**
   * @param user Usuário
   * @returns Retorna a descrição do usuário
   */
  public getUserDescription(user: User | string) {
    if (User.getId(user) == this.id) return this.getBotDescription();

    return this.bot.getUserDescription(User.get(user, this.id));
  }

  /** Define a descrição do usuário
   * @param user Usuário
   * @param description Descrição do usuário
   */
  public setUserDescription(user: User | string, description: string) {
    if (User.getId(user) == this.id) return this.setBotDescription(description);

    return this.bot.setUserDescription(User.get(user, this.id), description);
  }

  /**
   * @param user Usuário
   * @returns Retorna a foto de perfil do usuário
   */
  public getUserProfile(user: User | string, lowQuality?: boolean) {
    if (User.getId(user) == this.id) return this.getBotProfile(lowQuality);

    return this.bot.getUserProfile(User.get(user, this.id), lowQuality);
  }

  /** Define a imagem de perfil do usuário
   * @param user Usuário
   * @param profile Imagem de perfil do usuário
   */
  public setUserProfile(user: User | string, profile: Buffer) {
    if (User.getId(user) == this.id) return this.setBotProfile(profile);

    return this.bot.setUserProfile(User.get(user, this.id), profile);
  }

  /** Desbloqueia um usuário
   * @param user Usuário
   */
  public unblockUser(user: User | string) {
    return this.bot.unblockUser(User.get(user, this.id));
  }

  /** Bloqueia um usuário
   * @param user Usuário
   */
  public blockUser(user: User | string) {
    return this.bot.blockUser(User.get(user, this.id));
  }

  /**
   * Retorna a lista de clientes diponíveis.
   * @returns Clientes ordenados pelo ID.
   */
  public static getClients(): Record<string, Client<IBot>> {
    if (!global.hasOwnProperty("rompot-clients") || typeof global["rompot-clients"] != "object") {
      global["rompot-clients"] = {};
    }

    return global["rompot-clients"];
  }

  /**
   * Define todos os clientes diponíveis.
   * @param clients - Clientes que serão definidios.
   */
  public static saveClients(clients: Record<string, Client<IBot>>): void {
    global["rompot-clients"] = clients;
  }

  /**
   * Retorna o cliente pelo seu respectivo ID.
   * @param id - ID do cliente.
   * @returns O cliente associado ao ID.
   */
  public static getClient(id: string): Client<IBot> {
    const clients = Client.getClients();

    if (clients.hasOwnProperty(id) && typeof clients[id] == "object") {
      return clients[id];
    }

    return new Client(new BotBase());
  }

  /**
   * Define um cliente disponível
   * @param client - Cliente que será definido
   */
  public static saveClient(client: Client<IBot>): void {
    const clients = Client.getClients();

    clients[client.id] = client;

    Client.saveClients(clients);
  }

  /** Gera um id único */
  public static generateId(): string {
    return `${process.pid}-${Date.now()}-${Object.keys(Client.getClients()).length}`;
  }
}
