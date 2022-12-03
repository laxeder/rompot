import { BehaviorSubject, catchError, of, OperatorFunction, Subject } from "rxjs";

import { Events, BotInterface, EventsName } from "../types/index";
import { Message } from "@messages/Message";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";
import { User } from "@models/User";

export class BaseBot implements BotInterface {
  public events: Events = {
    connection: new BehaviorSubject({}),
    "bot-message": new Subject(),
    message: new Subject(),
    member: new Subject(),
    chat: new Subject(),
    error: new Subject(),
  };

  public status: Status = new Status("offline");
  public user: any = {};

  constructor() {}

  public async send(message: Message | Status): Promise<any> {}
  public async connect(auth: any, config?: any): Promise<any> {}
  public async reconnect(config?: any): Promise<any> {}
  public async stop(reason?: any): Promise<any> {}

  public async getChat(id: string): Promise<any> {}
  public async setChat(chat: Chat) {}

  public async getChats(): Promise<any> {}
  public async setChats(chat: { [key: string]: Chat }) {}

  public async removeChat(id: Chat | string) {}
  public async addMember(chat: Chat, user: User) {}
  public async removeMember(chat: Chat, user: User) {}

  /**
   * * Adiciona um evento
   * @param eventName
   * @param event
   * @returns
   */
  on(eventName: keyof EventsName, event: any, pipe?: OperatorFunction<any, unknown>) {
    const error = catchError((err) => {
      this.events.error.next(err);
      return of("Error in event");
    });

    if (!!!pipe) return this.events[eventName].pipe(error).subscribe(event);
    return this.events[eventName].pipe(pipe, error).subscribe(event);
  }
}
