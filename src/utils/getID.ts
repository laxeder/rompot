import UserInterface from "@interfaces/UserInterface";
import { Chat } from "@modules/Chat";

export function getChatId(chat: Chat | string) {
  if (typeof chat == "string") {
    return String(chat || "");
  }

  if (typeof chat == "object" && !Array.isArray(chat) && chat?.id) {
    return String(chat.id);
  }

  return String(chat || "");
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
