import ChatInterface from "@interfaces/ChatInterface";
import UserInterface from "@interfaces/UserInterface";
import BotInterface from "@interfaces/BotInterface";
import BotControl from "@interfaces/BotControl";

import LocationMessage from "@messages/LocationMessage";
import ContactMessage from "@messages/ContactMessage";
import ButtonMessage from "@messages/ButtonMessage";
import MediaMessage from "@messages/MediaMessage";
import VideoMessage from "@messages/VideoMessage";
import ImageMessage from "@messages/ImageMessage";
import ListMessage from "@messages/ListMessage";
import Message from "@messages/Message";

import { Commands } from "@modules/Commands";
import { Command } from "@modules/Command";
import UserModule from "@modules/User";
import Chat from "@modules/Chat";
import User from "@modules/User";

import PromiseMessages from "@utils/PromiseMessages";
import { setBotProperty } from "@utils/bot";
import { getError } from "@utils/error";
import sleep from "@utils/sleep";

import { Users } from "../types/User";
import { Chats } from "../types/Chat";
import { MessageInterface } from "@interfaces/MessagesInterfaces";

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

    async readMessage(message: MessageInterface): Promise<void> {
      return bot.readMessage(message);
    },

    async send(message: MessageInterface): Promise<Message> {
      try {
        return Message.Inject(this, await this.sendMessage(message));
      } catch (err) {
        this.ev.emit("error", getError(err));
      }

      return Message.Inject(this, message);
    },

    async sendMessage(message: MessageInterface): Promise<Message> {
      try {
        return Message.Inject(this, await bot.sendMessage(message));
      } catch (err) {
        this.ev.emit("error", getError(err));
      }

      return Message.Inject(this, message);
    },

    awaitMessage(chat: ChatInterface | string, ignoreMessageFromMe: boolean = true, stopRead: boolean = true, ...ignoreMessages: Message[]): Promise<Message> {
      return this.promiseMessages.addPromiseMessage(Chat.getChatId(chat), ignoreMessageFromMe, stopRead, ...ignoreMessages);
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
      return bot.getChatName(Chat.getChat(chat));
    },

    getChatDescription(chat: ChatInterface | string) {
      return bot.getChatDescription(Chat.getChat(chat));
    },

    getChatProfile(chat: ChatInterface | string) {
      return bot.getChatProfile(Chat.getChat(chat));
    },

    setChatName(chat: ChatInterface | string, name: string) {
      return bot.setChatName(Chat.getChat(chat), name);
    },

    setChatDescription(chat: ChatInterface | string, description: string) {
      return bot.setChatDescription(Chat.getChat(chat), description);
    },

    setChatProfile(chat: ChatInterface | string, profile: Buffer) {
      return bot.setChatProfile(Chat.getChat(chat), profile);
    },

    addUserInChat(chat: ChatInterface | string, user: UserInterface | string) {
      return bot.addUserInChat(Chat.getChat(chat), User.getUser(user));
    },

    removerUserInChat(chat: ChatInterface | string, user: UserInterface | string) {
      return bot.removerUserInChat(Chat.getChat(chat), User.getUser(user));
    },

    promoteUserInChat(chat: ChatInterface | string, user: UserInterface | string): Promise<void> {
      return bot.promoteUserInChat(Chat.getChat(chat), User.getUser(user));
    },

    demoteUserInChat(chat: ChatInterface | string, user: UserInterface): Promise<void> {
      return bot.demoteUserInChat(Chat.getChat(chat), User.getUser(user));
    },

    leaveChat(chat: ChatInterface | string) {
      return bot.leaveChat(Chat.getChat(chat));
    },

    async getChat(chat: ChatInterface | string) {
      const chatInterface = await bot.getChat(Chat.getChat(chat));

      if (!chatInterface) return null;

      return Chat.Inject(this, chatInterface);
    },

    async getChatAdmins(chat: ChatInterface | string) {
      const admins = await bot.getChatAdmins(Chat.getChat(chat));

      const adminModules: Users = {};

      Object.keys(admins).forEach((id) => {
        adminModules[id] = User.Inject(this, admins[id]);
      });

      return adminModules;
    },

    async getChatLeader(chat: Chat | string) {
      const leader = await bot.getChatLeader(Chat.getChat(chat));

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
      const usr = await bot.getUser(User.getUser(user));

      if (usr) return UserModule.Inject(this, usr);

      return null;
    },

    removeUser(user: UserInterface | string) {
      return bot.removeUser(User.getUser(user));
    },

    getUserName(user: UserInterface | string) {
      const userId = User.getUserId(user);

      if (userId == this.id) return this.getBotName();

      return bot.getUserName(User.getUser(user));
    },

    setUserName(user: UserInterface | string, name: string) {
      const userId = User.getUserId(user);

      if (userId == this.id) return this.setBotName(name);

      return bot.setUserName(User.getUser(user), name);
    },

    getUserDescription(user: UserInterface | string) {
      const userId = User.getUserId(user);

      if (userId == this.id) return this.getBotDescription();

      return bot.getUserDescription(User.getUser(user));
    },

    setUserDescription(user: UserInterface | string, description: string) {
      const userId = User.getUserId(user);

      if (userId == this.id) return this.setBotDescription(description);

      return bot.setUserDescription(User.getUser(user), description);
    },

    getUserProfile(user: UserInterface | string) {
      const userId = User.getUserId(user);

      if (userId == this.id) return this.getBotProfile();

      return bot.getUserProfile(User.getUser(user));
    },

    setUserProfile(user: UserInterface | string, profile: Buffer) {
      const userId = User.getUserId(user);

      if (userId == this.id) return this.setBotProfile(profile);

      return bot.setUserProfile(User.getUser(user), profile);
    },

    unblockUser(user: UserInterface | string) {
      return bot.unblockUser(User.getUser(user));
    },

    blockUser(user: UserInterface | string) {
      return bot.blockUser(User.getUser(user));
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
      return Chat.Inject(this, bot.Chat(Chat.getChatId(chat)));
    },

    User(user: UserInterface | string) {
      return User.Inject(this, bot.User(User.getUserId(user)));
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

    Message(chat: ChatInterface | string, text: string): Message {
      const message = Message.Inject(this, bot.Message(Chat.getChat(chat), text));

      message.chat = Chat.Inject(this, Chat.getChat(chat));

      return message;
    },

    MediaMessage(chat: ChatInterface | string, text: string, file: any): MediaMessage {
      const message = MediaMessage.Inject(this, bot.MediaMessage(Chat.getChat(chat), text, file));

      message.chat = Chat.Inject(this, Chat.getChat(chat));

      return message;
    },

    ImageMessage(chat: ChatInterface | string, text: string, image: Buffer): ImageMessage {
      const message = ImageMessage.Inject(this, bot.ImageMessage(Chat.getChat(chat), text, image));

      message.chat = Chat.Inject(this, Chat.getChat(chat));

      return message;
    },

    VideoMessage(chat: ChatInterface | string, text: string, video: Buffer): VideoMessage {
      const message = VideoMessage.Inject(this, bot.VideoMessage(Chat.getChat(chat), text, video));

      message.chat = Chat.Inject(this, Chat.getChat(chat));

      return message;
    },

    ContactMessage(chat: ChatInterface | string, text: string, contact: string | string[]): ContactMessage {
      const message = ContactMessage.Inject(this, bot.ContactMessage(Chat.getChat(chat), text, contact));

      message.chat = Chat.Inject(this, Chat.getChat(chat));

      return message;
    },

    LocationMessage(chat: ChatInterface | string, longitude: string, latitude: string): LocationMessage {
      const message = LocationMessage.Inject(this, bot.LocationMessage(Chat.getChat(chat), longitude, latitude));

      message.chat = Chat.Inject(this, Chat.getChat(chat));

      return message;
    },

    ListMessage(chat: ChatInterface | string, text: string, button: string): ListMessage {
      const message = ListMessage.Inject(this, bot.ListMessage(Chat.getChat(chat), text, button));

      message.chat = Chat.Inject(this, Chat.getChat(chat));

      return message;
    },

    ButtonMessage(chat: ChatInterface | string, text: string): ButtonMessage {
      const message = ButtonMessage.Inject(this, bot.ButtonMessage(Chat.getChat(chat), text));

      message.chat = Chat.Inject(this, Chat.getChat(chat));

      return message;
    },
  };

  return botModule;
}
