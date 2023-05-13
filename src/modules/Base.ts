import type { BotStatus } from "../types/Bot";

import { IBot } from "@interfaces/IBot";

import Client from "@modules/Client";
import User from "@modules/User";

import { BotEvents } from "@utils/Emmiter";

export function ClientBase() {
  return new Client<BotBase>(new BotBase());
}

export class BotBase implements IBot {
  id = "";
  status: BotStatus = "offline";
  ev: BotEvents = new BotEvents();

  async connect(auth) {}

  async reconnect(alert?) {}

  async stop(reason) {}

  async addReaction(message, reaction) {}

  async removeReaction(message) {}

  async readMessage(message) {}

  async send(message) {
    return message;
  }

  async removeMessage(message) {}

  async deleteMessage(message) {}

  async downloadStreamMessage(media) {
    return Buffer.from("");
  }

  async getBotName() {
    return "";
  }

  async setBotName(name) {}

  async getBotDescription() {
    return "";
  }

  async setBotDescription(description) {}

  async getBotProfile() {
    return Buffer.from("");
  }

  async setBotProfile(image) {}

  async addChat(chat) {}

  async removeChat(chat) {}

  async addUserInChat(chat, user) {}

  async removeUserInChat(chat, user) {}

  async promoteUserInChat(chat, user) {}

  async demoteUserInChat(chat, user) {}

  async changeChatStatus(chat, status) {}

  async createChat(chat) {}

  async leaveChat(chat) {}

  async getChat(chat) {
    return null;
  }

  async setChat(chat) {}

  async getChatName(chat) {
    return "";
  }

  async setChatName(chat, name) {}

  async getChatDescription(chat) {
    return "";
  }

  async setChatDescription(chat, description) {}

  async getChatProfile(chat) {
    return Buffer.from("");
  }

  async setChatProfile(chat, profile) {}

  async getChatUsers(chat) {
    return {};
  }

  async getChatAdmins(chat) {
    return {};
  }

  async getChatLeader(chat) {
    return new User("");
  }

  async getChats() {
    return {};
  }

  async setChats(chats) {}

  async addUser(user) {}

  async removeUser(user) {}

  async getUser(user) {
    return null;
  }

  async setUser(user) {}

  async getUserName(user) {
    return "";
  }

  async setUserName(user, name) {}

  async getUserDescription(user) {
    return "";
  }

  async setUserDescription(user, description) {}

  async getUserProfile(user) {
    return Buffer.from("");
  }

  async setUserProfile(user, profile) {}

  async unblockUser(user) {}

  async blockUser(user) {}

  async getUsers() {
    return {};
  }

  async setUsers(users) {}
}
