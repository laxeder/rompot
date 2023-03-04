import { IMessage, MessageModule } from "@interfaces/Messages";
import { ChatModule, IChat } from "@interfaces/Chat";
import { IUser, UserModule } from "@interfaces/User";
import { ClientType } from "@interfaces/Client";
import ICommand from "@interfaces/ICommand";
import IBot from "@interfaces/IBot";
import Auth from "@interfaces/Auth";

import { GenerateMessage } from "@messages/Messages";
import Message from "@messages/Message";

import Chat, { GenerateChat } from "@modules/Chat";
import { GenerateUser } from "@modules/User";
import User from "@modules/User";

import PromiseMessages from "@utils/PromiseMessages";
import { setBotProperty } from "@utils/bot";
import { getError } from "@utils/error";
import Emmiter from "@utils/Emmiter";
import sleep from "@utils/sleep";

import { MessagesGenerate } from "../types/Message";
import { ChatStatus } from "../types/Chat";
import { ArgumentTypes } from "@utils/Generic";
import BotBase from "./BotBase";

export function Client<Bot extends IBot, Command extends ICommand>(bot: Bot) {
  const promiseMessages: PromiseMessages = new PromiseMessages();
  const autoMessages: any = {};
  const emmiter = new Emmiter();

  type Messages = typeof bot.messages;

  const client: ClientType<Bot, Command, Messages> = {
    ...bot,
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
      return promiseMessages.addPromiseMessage(Chat.getChatId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages);
    },

    async addAutomate(message: Message, timeout: number, chats?: { [key: string]: Chat }, id: string = String(Date.now())): Promise<any> {
      try {
        const now = Date.now();

        // Criar e atualizar dados da mensagem automatizada
        autoMessages[id] = { id, chats: chats || (await this.getChats()), updatedAt: now, message };

        // Aguarda o tempo definido
        await sleep(timeout - now);

        // Cancelar se estiver desatualizado
        if (autoMessages[id].updatedAt !== now) return;

        await Promise.all(
          autoMessages[id].chats.map(async (chat: Chat) => {
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

      setBotProperty(this, cmd);

      //@ts-ignore
      return cmd;
    },

    //! <==============================> CHAT <==============================>

    async getChat(chat: IChat | string): Promise<(IChat & ChatModule) | null> {
      const iChat = await bot.getChat(Chat.getChat(chat));

      if (!iChat) return null;

      return GenerateChat(this, iChat);
    },

    async setChat(chat: IChat) {
      bot.setChat(GenerateChat(this, chat));
    },

    async getChats(): Promise<{ [id: string]: IChat & ChatModule }> {
      const modules: { [id: string]: IChat & ChatModule } = {};

      const chats = await bot.getChats();

      for (const id in chats) {
        modules[id] = GenerateChat(this, chats[id]);
      }

      return modules;
    },

    async setChats(chats: { [id: string]: IChat & ChatModule }): Promise<void> {
      return bot.setChats(chats);
    },

    addChat(chat: string | IChat): Promise<void> {
      return bot.addChat(GenerateChat(this, Chat.getChat(chat)));
    },

    removeChat(chat: string | IChat): Promise<void> {
      return bot.removeChat(GenerateChat(this, Chat.getChat(chat)));
    },

    getChatName(chat: IChat | string) {
      return bot.getChatName(Chat.getChat(chat));
    },

    setChatName(chat: IChat | string, name: string) {
      return bot.setChatName(Chat.getChat(chat), name);
    },

    getChatDescription(chat: IChat | string) {
      return bot.getChatDescription(Chat.getChat(chat));
    },

    setChatDescription(chat: IChat | string, description: string) {
      return bot.setChatDescription(Chat.getChat(chat), description);
    },

    getChatProfile(chat: IChat | string) {
      return bot.getChatProfile(Chat.getChat(chat));
    },

    setChatProfile(chat: IChat | string, profile: Buffer) {
      return bot.setChatProfile(Chat.getChat(chat), profile);
    },

    async changeChatStatus(chat: string | IChat, status: ChatStatus): Promise<void> {
      return bot.changeChatStatus(GenerateChat(this, Chat.getChat(chat)), status);
    },

    addUserInChat(chat: IChat | string, user: IUser | string) {
      return bot.addUserInChat(Chat.getChat(chat), User.getUser(user));
    },

    removeUserInChat(chat: IChat | string, user: IUser | string) {
      return bot.removeUserInChat(Chat.getChat(chat), User.getUser(user));
    },

    promoteUserInChat(chat: IChat | string, user: IUser | string) {
      return bot.promoteUserInChat(Chat.getChat(chat), User.getUser(user));
    },

    demoteUserInChat(chat: IChat | string, user: IUser) {
      return bot.demoteUserInChat(Chat.getChat(chat), User.getUser(user));
    },

    createChat(chat: IChat) {
      return bot.createChat(Chat.getChat(chat));
    },

    leaveChat(chat: IChat | string) {
      return bot.leaveChat(Chat.getChat(chat));
    },

    async getChatAdmins(chat: IChat | string) {
      const admins = await bot.getChatAdmins(Chat.getChat(chat));

      const adminModules: { [id: string]: IUser & UserModule } = {};

      Object.keys(admins).forEach((id) => {
        adminModules[id] = GenerateUser(this, admins[id]);
      });

      return adminModules;
    },

    async getChatLeader(chat: IChat | string) {
      const leader = await bot.getChatLeader(Chat.getChat(chat));

      return GenerateUser(this, leader);
    },

    //! <==============================> USER <==============================>

    async getUser(user: string) {
      const usr = await bot.getUser(User.getUser(user));

      if (usr) return GenerateUser(this, usr);

      return null;
    },

    async setUser(user: string | IUser) {
      return bot.setUser(GenerateUser(this, User.getUser(user)));
    },

    async getUsers() {
      const modules: { [id: string]: IUser & UserModule } = {};

      const users = await bot.getUsers();

      for (const id in users) {
        modules[id] = GenerateUser(this, users[id]);
      }

      return modules;
    },

    setUsers(users: { [id: string]: IUser & UserModule }) {
      return bot.setUsers(users);
    },

    addUser(user: string | IUser) {
      return bot.addUser(GenerateUser(this, User.getUser(user)));
    },

    removeUser(user: IUser | string) {
      return bot.removeUser(User.getUser(user));
    },

    getUserName(user: IUser | string) {
      if (User.getUserId(user) == this.id) return this.getBotName();

      return bot.getUserName(User.getUser(user));
    },

    setUserName(user: IUser | string, name: string) {
      if (User.getUserId(user) == this.id) return this.setBotName(name);

      return bot.setUserName(User.getUser(user), name);
    },

    getUserDescription(user: IUser | string) {
      if (User.getUserId(user) == this.id) return this.getBotDescription();

      return bot.getUserDescription(User.getUser(user));
    },

    setUserDescription(user: IUser | string, description: string) {
      if (User.getUserId(user) == this.id) return this.setBotDescription(description);

      return bot.setUserDescription(User.getUser(user), description);
    },

    getUserProfile(user: IUser | string) {
      if (User.getUserId(user) == this.id) return this.getBotProfile();

      return bot.getUserProfile(User.getUser(user));
    },

    setUserProfile(user: IUser | string, profile: Buffer) {
      if (User.getUserId(user) == this.id) return this.setBotProfile(profile);

      return bot.setUserProfile(User.getUser(user), profile);
    },

    unblockUser(user: IUser | string) {
      return bot.unblockUser(User.getUser(user));
    },

    blockUser(user: IUser | string) {
      return bot.blockUser(User.getUser(user));
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

    Chat(chat: Chat | string): IChat & ChatModule {
      return GenerateChat(this, bot.Chat(Chat.getChat(chat)));
    },

    User(user: IUser | string): IUser & UserModule {
      return GenerateUser(this, bot.User(User.getUser(user)));
    },

    ...(<Messages extends { [key: string]: (...args: any) => any }>(messages: Messages) =>
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
