export type WAChats = { [id: string]: WAChat };

import { WAUsers } from "@wa/WAUser";

import Chat from "@modules/Chat";

import { ChatStatus, ChatType } from "../types/Chat";

export default class WAChat extends Chat {
  public name: string;
  public description: string;
  public profile: Buffer;
  public users: WAUsers;

  constructor(id: string, type?: ChatType, name?: string, description?: string, profile?: Buffer, users?: WAUsers, status?: ChatStatus) {
    super(id);

    this.id = id;
    this.type = type || "pv";
    this.name = name || "";
    this.description = description || "";
    this.profile = profile || Buffer.from("");
    this.status = status || "offline";
    this.users = users || {};
  }
}
