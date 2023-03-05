import { IMessage, IMessages, MessageModule } from "@interfaces/Messages";
import { IChatModule, IChat } from "@interfaces/Chat";
import { IUser, IUserModule } from "@interfaces/User";
import { ClientType } from "@interfaces/Client";
import ICommand from "@interfaces/ICommand";
import IBot from "@interfaces/IBot";
import Auth from "@interfaces/Auth";

import { GenerateMessage } from "@messages/Messages";
import Message from "@messages/Message";

import { ChatModule } from "@modules/Chat";
import { UserModule } from "@modules/User";

import { ArgumentTypes, getChat, getChatId, setClientProperty, getError, sleep, getUser, getUserId } from "@utils/Generic";
import PromiseMessages from "@utils/PromiseMessages";
import { ClientEvents } from "@utils/Emmiter";

import { Chats, ChatStatus, IChats } from "../types/Chat";
import { MessagesGenerate } from "../types/Message";
import { IUsers, Users } from "../types/User";

export type Client = ClientType<IBot, ICommand, MessagesGenerate<IMessages>>;

export function Client<Bot extends IBot, Command extends ICommand>(bot: Bot) {
  const promiseMessages: PromiseMessages = new PromiseMessages();
  const autoMessages: any = {};
  const emmiter = new ClientEvents();

  type Messages = typeof bot.messages;

  const client: ClientType<Bot, Command, Messages> = {
    ...bot,
    ...new ClientEvents(),
    commands: [],

    events: emmiter.events,
    on: emmiter.on,
    off: emmiter.off,
    removeAllListeners: emmiter.removeAllListeners,
    emit: emmiter.emit,

    configEvents() {
      bot.ev.on("message", (message: Message) => {
        try {
          if (promiseMessages.resolvePromiseMessages(message)) return;

          if (message.fromMe && this.config.disableAutoCommand) return;
          if (this.config.disableAutoCommand) return;

          this.config.commandConfig.get(message.text, this.commands)?.execute(message);
        } catch (err) {
          this.emit("error", getError(err));
        }
      });

      bot.ev.on("me", (message: Message) => {
        try {
          if (promiseMessages.resolvePromiseMessages(message)) return;

          if (this.config.disableAutoCommand || this.config.receiveAllMessages) return;

          this.getCommand(message.text)?.execute(message);
        } catch (err) {
          this.emit("error", getError(err));
        }
      });
    },

    connect(auth: Auth | string) {
      return bot.connect(auth);
    },

    reconnect(alert?: boolean) {
      return bot.reconnect(alert);
    },

    stop(reason: any) {
      return bot.stop(reason);
    },

    addReaction(message: IMessage, reaction: string): Promise<void> {
      return bot.addReaction(message, reaction);
    },

    removeReaction(message: IMessage): Promise<void> {
      return bot.removeReaction(message);
    },

    deleteMessage(message: IMessage): Promise<void> {
      return bot.removeMessage(message);
    },

    removeMessage(message: IMessage): Promise<void> {
      return bot.removeMessage(message);
    },

    async readMessage(message: IMessage) {
      return bot.readMessage(message);
    },

    async send(message: IMessage): Promise<IMessage & MessageModule> {
      try {
        return GenerateMessage(this, await bot.send(message));
      } catch (err) {
        this.emit("error", getError(err));
      }

      return GenerateMessage(this, message);
    },

    awaitMessage(chat: IChat | string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: Message[]): Promise<Message> {
      return promiseMessages.addPromiseMessage(getChatId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages);
    },

    async addAutomate(message: Message, timeout: number, chats?: { [key: string]: ChatModule }, id: string = String(Date.now())): Promise<any> {
      try {
        const now = Date.now();

        // Criar e atualizar dados da mensagem automatizada
        autoMessages[id] = { id, chats: chats || (await this.getChats()), updatedAt: now, message };

        // Aguarda o tempo definido
        await sleep(timeout - now);

        // Cancelar se estiver desatualizado
        if (autoMessages[id].updatedAt !== now) return;

        await Promise.all(
          autoMessages[id].chats.map(async (chat: ChatModule) => {
            const automated: any = autoMessages[id];

            if (automated.updatedAt !== now) return;

            automated.message?.setChat(chat);

            // Enviar mensagem
            await this.send(automated.message);

            // Remover sala de bate-papo da mensagem
            const nowChats = automated.chats;
            const index = nowChats.indexOf(automated.chats[chat.id]);
            autoMessages[id].chats = nowChats.splice(index + 1, nowChats.length);
          })
        );
      } catch (err) {
        this.emit("error", getError(err));
      }
    },

    setCommands(commands: Command[]) {
      this.commands = commands;
    },

    getCommands() {
      return this.commands;
    },

    addCommand(command: Command) {
      this.commands.push(command);
    },

    getCommand(command: string): Command | null {
      const cmd = this.config.commandConfig?.get(command, this.commands);

      if (!cmd) return null;

      setClientProperty(this, cmd);

      //@ts-ignore
      return cmd;
    },

    //! <==============================> CHAT <==============================>

    async getChat(chat: IChat | string): Promise<ChatModule | null> {
      const iChat = await bot.getChat(getChat(chat));

      if (!iChat) return null;

      return ChatModule(this, iChat);
    },

    async setChat(chat: IChat) {
      bot.setChat(ChatModule(this, chat));
    },

    async getChats(): Promise<Chats> {
      const modules: Chats = {};

      const chats = await bot.getChats();

      for (const id in chats) {
        modules[id] = ChatModule(this, chats[id]);
      }

      return modules;
    },

    async setChats(chats: IChats): Promise<void> {
      return bot.setChats(chats);
    },

    addChat(chat: string | IChat): Promise<void> {
      return bot.addChat(ChatModule(this, getChat(chat)));
    },

    removeChat(chat: string | IChat): Promise<void> {
      return bot.removeChat(ChatModule(this, getChat(chat)));
    },

    getChatName(chat: IChat | string) {
      return bot.getChatName(getChat(chat));
    },

    setChatName(chat: IChat | string, name: string) {
      return bot.setChatName(getChat(chat), name);
    },

    getChatDescription(chat: IChat | string) {
      return bot.getChatDescription(getChat(chat));
    },

    setChatDescription(chat: IChat | string, description: string) {
      return bot.setChatDescription(getChat(chat), description);
    },

    getChatProfile(chat: IChat | string) {
      return bot.getChatProfile(getChat(chat));
    },

    setChatProfile(chat: IChat | string, profile: Buffer) {
      return bot.setChatProfile(getChat(chat), profile);
    },

    async changeChatStatus(chat: string | IChat, status: ChatStatus): Promise<void> {
      return bot.changeChatStatus(ChatModule(this, getChat(chat)), status);
    },

    addUserInChat(chat: IChat | string, user: IUser | string) {
      return bot.addUserInChat(getChat(chat), getUser(user));
    },

    removeUserInChat(chat: IChat | string, user: IUser | string) {
      return bot.removeUserInChat(getChat(chat), getUser(user));
    },

    promoteUserInChat(chat: IChat | string, user: IUser | string) {
      return bot.promoteUserInChat(getChat(chat), getUser(user));
    },

    demoteUserInChat(chat: IChat | string, user: IUser) {
      return bot.demoteUserInChat(getChat(chat), getUser(user));
    },

    createChat(chat: IChat) {
      return bot.createChat(getChat(chat));
    },

    leaveChat(chat: IChat | string) {
      return bot.leaveChat(getChat(chat));
    },

    async getChatAdmins(chat: IChat | string) {
      const admins = await bot.getChatAdmins(getChat(chat));

      const adminModules: Users = {};

      Object.keys(admins).forEach((id) => {
        adminModules[id] = UserModule(this, admins[id]);
      });

      return adminModules;
    },

    async getChatLeader(chat: IChat | string) {
      const leader = await bot.getChatLeader(getChat(chat));

      return UserModule(this, leader);
    },

    //! <==============================> USER <==============================>

    async getUser(user: string) {
      const usr = await bot.getUser(getUser(user));

      if (usr) return UserModule(this, usr);

      return null;
    },

    async setUser(user: string | IUser) {
      return bot.setUser(UserModule(this, getUser(user)));
    },

    async getUsers() {
      const modules: Users = {};

      const users = await bot.getUsers();

      for (const id in users) {
        modules[id] = UserModule(this, users[id]);
      }

      return modules;
    },

    setUsers(users: IUsers) {
      return bot.setUsers(users);
    },

    addUser(user: string | IUser) {
      return bot.addUser(UserModule(this, getUser(user)));
    },

    removeUser(user: IUser | string) {
      return bot.removeUser(getUser(user));
    },

    getUserName(user: IUser | string) {
      if (getUserId(user) == this.id) return this.getBotName();

      return bot.getUserName(getUser(user));
    },

    setUserName(user: IUser | string, name: string) {
      if (getUserId(user) == this.id) return this.setBotName(name);

      return bot.setUserName(getUser(user), name);
    },

    getUserDescription(user: IUser | string) {
      if (getUserId(user) == this.id) return this.getBotDescription();

      return bot.getUserDescription(getUser(user));
    },

    setUserDescription(user: IUser | string, description: string) {
      if (getUserId(user) == this.id) return this.setBotDescription(description);

      return bot.setUserDescription(getUser(user), description);
    },

    getUserProfile(user: IUser | string) {
      if (getUserId(user) == this.id) return this.getBotProfile();

      return bot.getUserProfile(getUser(user));
    },

    setUserProfile(user: IUser | string, profile: Buffer) {
      if (getUserId(user) == this.id) return this.setBotProfile(profile);

      return bot.setUserProfile(getUser(user), profile);
    },

    unblockUser(user: IUser | string) {
      return bot.unblockUser(getUser(user));
    },

    blockUser(user: IUser | string) {
      return bot.blockUser(getUser(user));
    },

    //! <===============================> BOT <==============================>

    getBotName() {
      return bot.getBotName();
    },

    setBotName(name: string) {
      return bot.setBotName(name);
    },

    getBotDescription() {
      return bot.getBotDescription();
    },

    setBotDescription(description: string) {
      return bot.setBotDescription(description);
    },

    getBotProfile() {
      return bot.getBotProfile();
    },

    setBotProfile(profile: Buffer) {
      return bot.setBotProfile(profile);
    },

    //! <=============================> MODULES <=============================>

    Chat(chat: IChat | string): ChatModule {
      return ChatModule(this, bot.Chat(getChat(chat)));
    },

    User(user: IUser | string): UserModule {
      return UserModule(this, bot.User(getUser(user)));
    },

    ...(<Messages extends IMessages>(messages: Messages) =>
      (Object.keys(messages) as Array<keyof Messages>).reduce(<Key extends keyof Messages>(result: MessagesGenerate<Messages>, key: Key) => {
        result[key] = (...args: ArgumentTypes<Messages[Key]>[]): ReturnType<Messages[Key]> & MessageModule => {
          return GenerateMessage(client, messages[key](...args));
        };

        return result;
      }, {} as MessagesGenerate<Messages>))(bot.messages),
  };

  client.configEvents();

  return client;
}
