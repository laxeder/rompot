import { IChat, ChatType } from "rompot-base";

import ChatController from "@modules/chat/controllers/ChatController";

export default class Chat extends ChatController implements IChat {
  public id: string = "";
  public type: ChatType = "pv";
  public name: string = "";

  constructor(id: string, type?: ChatType, name?: string) {
    super();

    this.id = id || "";
    this.type = type || "pv";
    this.name = name || "";

    this.chat = this;
  }
}
