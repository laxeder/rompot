import ChatInterface from "@interfaces/ChatInterface";
import UserInterface from "@interfaces/UserInterface";
import BotInterface from "@interfaces/BotInterface";
import BotControl from "@interfaces/BotControl";

import { LocationMessage } from "@messages/LocationMessage";
import { ReactionMessage } from "@messages/ReactionMessage";
import { ContactMessage } from "@messages/ContactMessage";
import { ButtonMessage } from "@messages/ButtonMessage";
import { MediaMessage } from "@messages/MediaMessage";
import { VideoMessage } from "@messages/VideoMessage";
import { ImageMessage } from "@messages/ImageMessage";
import { ListMessage } from "@messages/ListMessage";
import { Message } from "@messages/Message";

import { Commands } from "@modules/Commands";
import { Command } from "@modules/Command";
import UserModule from "@modules/User";
import Chat from "@modules/Chat";
import User from "@modules/User";

import { getChatId, getUser, getUserId } from "@utils/Marshal";
import PromiseMessages from "@utils/PromiseMessages";
import { setBotProperty } from "@utils/bot";
import { getError } from "@utils/error";
import sleep from "@utils/sleep";

import { Users } from "../types/User";
import { Chats } from "../types/Chat";

export function BuildBot<Bot extends BotInterface>(bot: Bot) {
  const autoMessages: any = {};
  const promiseMessages: PromiseMessages = new PromiseMessages();

  const botModule: BotControl & Bot = {
    ...bot,
    autoMessages,
    promiseMessages,

    //? ****** ***** CONFIG ***** ******

    configurate() {
      this.commands.setBot(this);

      this.configEvents();
    },

    configEvents() {
      this.ev.on("message", (message: Message) => {
        try {
          if (this.promiseMessages.resolvePromiseMessages(message)) return;

          if (this.config.disableAutoCommand) return;
          if (message.fromMe && !this.config.autoRunBotCommand) return;

          this.commands.getCommand(message.text)?.execute(message);
        } catch (err) {
          this.ev.emit("error", getError(err));
        }
      });

      this.ev.on("me", (message: Message) => {
        try {
          if (this.promiseMessages.resolvePromiseMessages(message)) return;

          if (!this.config.autoRunBotCommand || this.config.receiveAllMessages) return;

          this.commands.getCommand(message.text)?.execute(message);
        } catch (err) {
          this.ev.emit("error", getError(err));
        }
      });
    },

    //? ******* **** MESSAGE **** *******

    async send<Content extends Message>(content: Content): Promise<Content> {
      try {
        if (content instanceof Message) {
          //@ts-ignore
          return await this.sendMessage(content);
        }
      } catch (err) {
        this.ev.emit("error", getError(err));
      }

      return content;
    },

    awaitMessage(chat: Chat | string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: Message[]): Promise<Message> {
      if (chat instanceof Chat) return this.awaitMessage(chat.id, ignoreMessageFromMe, stopRead, ...ignoreMessages);

      return this.promiseMessages.addPromiseMessage(chat, ignoreMessageFromMe, stopRead, ...ignoreMessages);
    },

    async addAutomate(message: Message, timeout: number, chats?: { [key: string]: Chat }, id: string = String(Date.now())): Promise<any> {
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
        this.ev.emit("error", getError(err));
      }
    },

    //? ****** **** COMMANDS **** ******

    setCommands(commands: Bot["commands"]) {
      this.commands = commands;
      this.commands.setBot(this);
    },

    getCommands(): Bot["commands"] {
      return this.commands;
    },

    setCommand(command: Command) {
      this.commands.addCommand(command);
    },

    getCommand(command: Command | string | string[]) {
      //TODO: Criar função search command
      return this.commands.getCommand(command);
    },

    //? *************** CHAT **************

    getChatName(chat: ChatInterface | string) {
      return bot.getChatName(getChatId(chat));
    },

    getChatDescription(chat: ChatInterface | string) {
      return bot.getChatDescription(getChatId(chat));
    },

    getChatProfile(chat: ChatInterface | string) {
      return bot.getChatProfile(getChatId(chat));
    },

    setChatName(chat: ChatInterface | string, name: string) {
      return bot.setChatName(getChatId(chat), name);
    },

    setChatDescription(chat: ChatInterface | string, description: string) {
      return bot.setChatDescription(getChatId(chat), description);
    },

    setChatProfile(chat: ChatInterface | string, profile: Buffer) {
      return bot.setChatProfile(getChatId(chat), profile);
    },

    addUserInChat(chat: ChatInterface | string, user: UserInterface | string) {
      return bot.addUserInChat(getChatId(chat), getUser(user));
    },

    removerUserInChat(chat: ChatInterface | string, user: UserInterface | string) {
      return bot.removerUserInChat(getChatId(chat), getUserId(user));
    },

    promoteUserInChat(chat: ChatInterface | string, user: UserInterface | string): Promise<void> {
      return bot.promoteUserInChat(getChatId(chat), getUserId(user));
    },

    demoteUserInChat(chat: ChatInterface | string, user: UserInterface): Promise<void> {
      return bot.demoteUserInChat(getChatId(chat), getUserId(user));
    },

    leaveChat(chat: ChatInterface | string) {
      return bot.leaveChat(getChatId(chat));
    },

    async getChat(chat: ChatInterface | string) {
      const chatInterface = await bot.getChat(getChatId(chat));

      if (!chatInterface) return null;

      return Chat.Inject(this, chatInterface);
    },

    async getChatAdmins(chat: ChatInterface | string) {
      const admins = await bot.getChatAdmins(getChatId(chat));

      const adminModules: Users = {};

      Object.keys(admins).forEach((id) => {
        adminModules[id] = User.Inject(this, admins[id]);
      });

      return adminModules;
    },

    async getChatLeader(chat: Chat | string) {
      const leader = await bot.getChatLeader(getChatId(chat));

      return User.Inject(this, leader);
    },

    async getChats(): Promise<Chats> {
      const modules: Chats = {};

      const chats = await bot.getChats();

      for (const id in chats) {
        modules[id] = Chat.Inject(this, chats[id]);
      }

      return modules;
    },

    //? *************** USER **************

    async getUser(user: string): Promise<UserModule | null> {
      const usr = await bot.getUser(getUserId(user));

      if (usr) return UserModule.Inject(this, usr);

      return null;
    },

    removeUser(user: UserInterface | string) {
      return bot.removeUser(getUserId(user));
    },

    getUserName(user: UserInterface | string) {
      const userId = getUserId(user);

      if (userId == this.id) return this.getBotName();

      return bot.getUserName(userId);
    },

    setUserName(user: UserInterface | string, name: string) {
      const userId = getUserId(user);

      if (userId == this.id) return this.setBotName(name);

      return bot.setUserName(userId, name);
    },

    getUserDescription(user: UserInterface | string) {
      const userId = getUserId(user);

      if (userId == this.id) return this.getBotDescription();

      return bot.getUserDescription(getUserId(user));
    },

    setUserDescription(user: UserInterface | string, description: string) {
      const userId = getUserId(user);

      if (userId == this.id) return this.setBotDescription(description);

      return bot.setUserDescription(userId, description);
    },

    getUserProfile(user: UserInterface | string) {
      const userId = getUserId(user);

      if (userId == this.id) return this.getBotProfile();

      return bot.getUserProfile(getUserId(user));
    },

    setUserProfile(user: UserInterface | string, profile: Buffer) {
      const userId = getUserId(user);

      if (userId == this.id) return this.setBotProfile(profile);

      return bot.setUserProfile(userId, profile);
    },

    unblockUser(user: UserInterface | string) {
      return bot.unblockUser(getUserId(user));
    },

    blockUser(user: UserInterface | string) {
      return bot.blockUser(getUserId(user));
    },

    async getUsers(): Promise<Users> {
      const modules: Users = {};

      const users = await bot.getUsers();

      for (const id in users) {
        modules[id] = User.Inject(this, users[id]);
      }

      return modules;
    },

    //? ************** MODELS **************

    Chat(chat: ChatInterface | string) {
      return Chat.Inject(this, bot.Chat(getChatId(chat)));
    },

    User(user: UserInterface | string) {
      return User.Inject(this, bot.User(getUserId(user)));
    },

    Command(...names: string[]): Command {
      const command = new Command(names);
      setBotProperty(command, this);
      return command;
    },

    Commands(): Commands {
      const commands = new Commands();
      setBotProperty(commands, this);
      return commands;
    },

    //? ************** MESSAGE *************

    Message(chat: Chat | string, text: string): Message {
      const message = new Message(chat, text);
      setBotProperty(message, this);
      return message;
    },

    ImageMessage(chat: Chat | string, text: string, image: Buffer): ImageMessage {
      const message = new ImageMessage(chat, text, image);
      setBotProperty(message, this);
      return message;
    },

    VideoMessage(chat: Chat | string, text: string, video: Buffer): VideoMessage {
      const message = new VideoMessage(chat, text, video);
      setBotProperty(message, this);
      return message;
    },

    ContactMessage(chat: Chat | string, text: string, contact: UserInterface | string): ContactMessage {
      const message = new ContactMessage(chat, text, contact);
      setBotProperty(message, this);
      return message;
    },

    LocationMessage(chat: Chat | string, longitude: string, latitude: string): LocationMessage {
      const message = new LocationMessage(chat, text, longitude, latitude);
      setBotProperty(message, this);
      return message;
    },

    ListMessage(chat: Chat | string, text: string): ListMessage {
      const message = new ListMessage(chat, text);
      setBotProperty(message, this);
      return message;
    },

    ButtonMessage(chat: Chat | string, text: string): ButtonMessage {
      const message = new ButtonMessage(chat, text);
      setBotProperty(message, this);
      return message;
    },

    MediaMessage(chat: Chat | string, text: string): MediaMessage {
      const message = new MediaMessage(chat, text);
      setBotProperty(message, this);
      return message;
    },

    ReactionMessage(msg: Message, text: string): ReactionMessage {
      const message = new ReactionMessage(new Chat(""), text, msg);
      setBotProperty(message, this);
      return message;
    },
  };

  return botModule;
}
