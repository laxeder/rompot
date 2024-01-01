import TelegramBotAPI from "node-telegram-bot-api";

import { ChatType } from "../chat/ChatType";

export namespace TelegramUtils {
  export function getId(data: Partial<TelegramBotAPI.Chat & TelegramBotAPI.User & TelegramBotAPI.Contact>): string {
    if (!data || typeof data != "object") {
      return "";
    }

    return `${data.id || data.user_id || ""}`;
  }

  export function getName(data: Partial<TelegramBotAPI.Chat & TelegramBotAPI.User & TelegramBotAPI.Contact>): string {
    if (!data || typeof data != "object") {
      return "";
    }

    if (data.first_name && data.last_name) {
      return `${data.first_name} ${data.last_name}`;
    }

    if (data.first_name) {
      return `${data.first_name}`;
    }

    if (data.username) {
      return `${data.username}`;
    }

    return "";
  }

  export function getNickname(data: Partial<TelegramBotAPI.Chat & TelegramBotAPI.User & TelegramBotAPI.Contact>): string {
    if (!data || typeof data != "object") {
      return "";
    }

    return `${data.username || ""}`;
  }

  export function getChatType(chat: TelegramBotAPI.Chat): ChatType {
    if (!chat || typeof chat != "object") {
      return ChatType.PV;
    }

    return chat.type == "private" ? ChatType.PV : ChatType.Group;
  }

  export function getPhoneNumber(id: string | number): string {
    return `${id}`.replace(/\D+/g, "") || "0";
  }

  export function getText(msg: TelegramBotAPI.Message): string {
    if (!msg || typeof msg != "object") {
      return "";
    }

    return `${msg.text || msg.caption || ""}`;
  }

  export function getMention(text: string, entity: TelegramBotAPI.MessageEntity): string {
    if (!text || !entity || typeof entity != "object") {
      return "";
    }

    if (entity.type != "mention") {
      return "";
    }

    const start = Number(entity.offset || -1) + 1;
    const end = start + Number(entity.length || 0);

    if (end >= text.length) {
      return "";
    }

    return `${text.slice(start, end)}`;
  }

  export function getMentions(text: string, entities: TelegramBotAPI.MessageEntity | TelegramBotAPI.MessageEntity[]): string[] {
    if (!text || !entities) {
      return [];
    }

    if (!Array.isArray(entities)) {
      entities = [entities];
    }

    return entities.reduce((mentions, entity) => {
      const mention = getMention(text, entity);

      if (mention) {
        mentions.push(mention);
      }

      return mentions;
    }, [] as string[]);
  }

  export function getMessageMentions(msg: TelegramBotAPI.Message): string[] {
    return getMentions(getText(msg), msg.entities!);
  }

  export async function downloadFileFromURL(url: string): Promise<Buffer> {
    return Buffer.from(await (await fetch(url)).arrayBuffer());
  }
}
