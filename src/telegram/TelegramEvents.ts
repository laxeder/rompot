import TelegramBotAPI from "node-telegram-bot-api";

import Chat from "../chat/Chat";
import User from "../user/User";

import TelegramToRompotConverter from "./TelegramToRompotConverter";
import { TelegramUtils } from "./TelegramUtils";
import TelegramBot from "./TelegramBot";

export default class TelegramEvents {
  public telegram: TelegramBot;

  constructor(telegram: TelegramBot) {
    this.telegram = telegram;
  }

  public configAll() {
    this.configMessage();
    this.configNewChatMembers();
    this.configLeftChatMember();
  }

  public configMessage() {
    const receievMessage = async (msg: TelegramBotAPI.Message) => {
      if (msg?.new_chat_members) return;
      if (msg?.left_chat_member) return;

      const converter = new TelegramToRompotConverter(msg);

      const rompotMessage = await converter.convert(true);

      await this.update(rompotMessage.user);
      await this.update(rompotMessage.chat);

      this.telegram.emit("message", rompotMessage);
    };

    this.telegram.bot.on("message", receievMessage);
    this.telegram.bot.on("edited_message", receievMessage);
  }

  public configNewChatMembers() {
    this.telegram.bot.on("new_chat_members", async (msg) => {
      const converter = new TelegramToRompotConverter(msg);

      const rompotMessage = await converter.convert(true);

      for (const member of msg.new_chat_members || []) {
        const userId: string = TelegramUtils.getId(member);

        const user = User.fromJSON({
          ...((await this.telegram.getUser(new User(userId))) || {}),
          id: userId,
          name: TelegramUtils.getName(member),
          nickname: TelegramUtils.getNickname(member),
          phoneNumber: TelegramUtils.getPhoneNumber(userId),
        });

        await this.updateChatUsers("add", rompotMessage.chat, user);

        await this.update(user);
        await this.update(rompotMessage.user);
        await this.update(rompotMessage.chat);

        if (rompotMessage.user.id == user.id) {
          this.telegram.emit("user", { action: "join", event: "add", user, chat: rompotMessage.chat, fromUser: rompotMessage.user });
        } else {
          this.telegram.emit("user", { action: "add", event: "add", user, chat: rompotMessage.chat, fromUser: rompotMessage.user });
        }
      }
    });
  }

  public configLeftChatMember() {
    this.telegram.bot.on("left_chat_member", async (msg) => {
      const converter = new TelegramToRompotConverter(msg);

      const rompotMessage = await converter.convert(true);

      const userId: string = TelegramUtils.getId(msg.left_chat_member!);

      const user = User.fromJSON({
        ...((await this.telegram.getUser(new User(userId))) || {}),
        id: userId,
        name: TelegramUtils.getName(msg.left_chat_member!),
        nickname: TelegramUtils.getNickname(msg.left_chat_member!),
        phoneNumber: TelegramUtils.getPhoneNumber(userId),
      });

      await this.update(user);
      await this.update(rompotMessage.user);
      await this.update(rompotMessage.chat);

      await this.updateChatUsers("remove", rompotMessage.chat, user);

      if (rompotMessage.user.id == user.id) {
        this.telegram.emit("user", { action: "leave", event: "remove", user, chat: rompotMessage.chat, fromUser: rompotMessage.user });
      } else {
        this.telegram.emit("user", { action: "remove", event: "remove", user, chat: rompotMessage.chat, fromUser: rompotMessage.user });
      }
    });
  }

  public async update(data: User | Chat) {
    try {
      if (!data) return;

      if (data instanceof User) {
        return await this.telegram.updateUser(data);
      }

      if (data instanceof Chat) {
        return await this.telegram.updateChat(data);
      }
    } catch (error) {
      this.telegram.emit("error", error);
    }
  }

  public async updateChatUsers(action: "add" | "remove", chat: Chat, ...users: User[]) {
    try {
      chat = Chat.fromJSON({
        ...((await this.telegram.getChat(chat)) || {}),
        ...chat,
      });

      if (action == "add") {
        users = users.filter((user) => !chat.users.includes(user.id));

        if (users.length == 0) return;

        chat.users.push(...users.map((user) => user.id));

        await this.update(chat);
      } else if (action == "remove") {
        const userIds = users.map((user) => user.id);

        if (userIds.includes(this.telegram.id)) {
          await this.telegram.removeChat(chat);
        } else {
          chat.users = chat.users.filter((userId) => !userIds.includes(userId));

          await this.update(chat);
        }
      }
    } catch (error) {
      this.telegram.emit("error", error);
    }
  }
}
