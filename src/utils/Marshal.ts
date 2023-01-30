import ChatInterface from "@interfaces/ChatInterface";
import UserInterface from "@interfaces/UserInterface";

import Chat from "@modules/Chat";
import User from "@modules/User";

export function getChatId(chat: ChatInterface | string) {
  if (typeof chat == "string") {
    return String(chat || "");
  }

  if (typeof chat == "object" && !Array.isArray(chat) && chat?.id) {
    return String(chat.id);
  }

  return String(chat || "");
}

export function getChat<ChatIn extends ChatInterface>(chat: ChatIn | string): ChatIn | ChatInterface {
  if (typeof chat == "string") {
    return new Chat(chat);
  }

  return chat;
}

export function getUserId(user: UserInterface | string) {
  if (typeof user == "string") {
    return String(user || "");
  }

  if (typeof user == "object" && !Array.isArray(user) && user?.id) {
    return String(user.id);
  }

  return String(user || "");
}

export function getUser(user: UserInterface | string): UserInterface {
  if (typeof user == "string") {
    return new User(user);
  }

  return user;
}
