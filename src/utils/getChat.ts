import { Chat } from "@models/Chat";

export function getChatId(chat: Chat | string) {
  if (typeof chat == "string") {
    return String(chat || "");
  }

  if (typeof chat == "object" && !Array.isArray(chat) && chat?.id) {
    return String(chat.id);
  }

  return String(chat || "");
}
