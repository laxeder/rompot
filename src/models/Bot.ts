import PromiseMessages from "@utils/PromiseMessages";
import { BotInterface } from "@models/BotInterface";
import { Message } from "@messages/Message";
import { BotControl } from "../types/Bot";
import { getError } from "@utils/error";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";
import { Command } from "./Command";
import sleep from "@utils/sleep";
import { User } from "./User";

export function BuildBot<Bot extends BotInterface>(bot: Bot) {
  const autoMessages: any = {};
  const promiseMessages: PromiseMessages = new PromiseMessages();

  const botModule: Bot & BotControl = {
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

    async send<Content extends Message | Status>(content: Content): Promise<Content> {
      try {
        if (content instanceof Message) {
          //@ts-ignore
          return await this.sendMessage(content);
        }

        if (content instanceof Status) {
          //@ts-ignore
          return await this.sendStatus(content);
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

    //? ******* ***** USER ***** *******

    async getUserName(user: User | string): Promise<string> {
      if (user instanceof User) return this.getUserName(user.id);

      if (user == this.id) return this.getBotName();

      return (await this.getUser(user))?.name || "";
    },

    async getUserDescription(user: User | string): Promise<string> {
      if (user instanceof User) return this.getUserDescription(user.id);

      if (user == this.id) return this.getBotDescription();

      return (await (await this.getUser(user))?.getDescription()) || "";
    },

    async getUserProfile(user: User | string): Promise<Buffer | null> {
      if (user instanceof User) return this.getUserProfile(user.id);

      if (user == this.id) return this.getBotProfile();

      return (await (await this.getUser(user))?.getProfile()) || null;
    },

    //? ******* ***** CHAT ***** *******

    async getChatName(chat: Chat | string): Promise<string> {
      if (chat instanceof Chat) return this.getChatName(chat.id);

      return (await this.getChat(chat))?.name || "";
    },

    async getChatDescription(chat: Chat | string): Promise<string> {
      if (chat instanceof Chat) return this.getChatDescription(chat.id);

      return (await this.getChat(chat))?.description || "";
    },

    async getChatProfile(chat: Chat | string): Promise<Buffer | null> {
      if (chat instanceof Chat) return this.getChatProfile(chat.id);

      return (await (await this.getChat(chat))?.getProfile()) || null;
    },
  };

  return botModule;
}
