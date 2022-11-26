import { BehaviorSubject, Subject } from "rxjs";

import { Events, BotInterface, EventsName } from "../types/index";
import { Message } from "@models/Message";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";

export class BaseBot implements BotInterface {
  public events: Events = { connection: new BehaviorSubject({}), messages: new Subject(), chats: new Subject() };

  public status: Status = new Status("offline");
  public chats: { [key: string]: Chat } = {};
  public user: any = {};

  //!TODO: Implimentar usuários
  // public users: Users = {};

  constructor() {
    this.events.chats.subscribe((chat: Chat) => (this.chats[chat.id] = chat));
  }

  public async send(message: Message | Status): Promise<any> {}
  public async connect(auth: any, config?: any): Promise<any> {}
  public async reconnect(config?: any): Promise<any> {}
  public async stop(reason?: any): Promise<any> {}

  /**
   * * Adiciona um evento
   * @param eventName
   * @param event
   */
  addEvent(eventName: keyof EventsName, event: any): void {
    this.events[eventName].subscribe(event);
  }
}
