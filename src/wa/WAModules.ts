import { ChatType } from "rompot-base";

import ChatUtils from "@modules/chat/utils/ChatUtils";
import Chat from "@modules/chat/models/Chat";
import User from "@modules/user/models/User";
import Message from "@messages/Message";

import { injectJSON } from "@utils/Generic";

export class WAUser extends User {
  /** * Nome */
  public name: string;
  /** * Descrição */
  public description: string;
  /** * Foto de perfil */
  public profile: Buffer;
  /** * É administrador */
  public isChatAdmin: boolean;
  /** É líder */
  public isChatLeader: boolean;

  constructor(id: string, name?: string, description?: string, profile?: Buffer) {
    super(id);

    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");
    this.isChatAdmin = false;
    this.isChatLeader = false;
  }
}

export class WAChat extends Chat {
  /** * Nome */
  public name: string;
  /** * Descrição */
  public description: string;
  /** * Foto de perfil */
  public profile: Buffer;
  /** * Usuários da sala de bate-papo */
  public users: Record<string, WAUser> = {};

  constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: Record<string, WAUser>) {
    super(id, type);

    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");
    this.users = users || {};
  }

  /**
   @returns Retorna o tipo da sala de bate-papo
   */
  public static getChatType(chat: Chat | string): ChatType {
    return ChatUtils.get(chat).id.includes("@g") ? "group" : "pv";
  }
}

export class WAMessage extends Message {
  /** * Sala de bate-papo que foi enviada a mensagem */
  public chat: WAChat;
  /** * Usuário que mandou a mensagem */
  public user: WAUser;
  /** * Mensagem mencionada na mensagem */
  public mention?: WAMessage | undefined;

  constructor(chat: WAChat | string, text: string, others: Partial<WAMessage>) {
    super(chat, text);

    injectJSON(others, this);
  }
}
