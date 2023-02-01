import { MessageInterface } from "@interfaces/MessagesInterfaces";
import ChatInterface from "@interfaces/ChatInterface";
import UserInterface from "@interfaces/UserInterface";

import Message from "@messages/Message";

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

export function getUser<UserIn extends UserInterface>(user: UserIn | string): UserIn | UserInterface {
  if (typeof user == "string") {
    return new User(user);
  }

  return user;
}

export function getMessage<MessageIn extends MessageInterface>(message: MessageIn | string): MessageIn | MessageInterface {
  if (typeof message == "string") {
    return new Message(new Chat(""), message);
  }

  return message;
}

export function getMessageId(message: MessageInterface | string): string {
  if (typeof message == "string") {
    return String(message || "");
  }

  if (typeof message == "object" && !Array.isArray(message) && message?.id) {
    return String(message.id);
  }

  return String(message || "");
}
