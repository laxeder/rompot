import { BehaviorSubject, catchError, of, OperatorFunction, Subject } from "rxjs";

import { Events, BotInterface, EventsName } from "../types/index";
import { Message } from "@buttons/Message";
import { Status } from "@models/Status";
import { Chat } from "@models/Chat";

export class BaseBot implements BotInterface {
  public events: Events = {
    connection: new BehaviorSubject({}),
    "bot-message": new Subject(),
    message: new Subject(),
    member: new Subject(),
    chats: new Subject(),
    error: new Subject(),
  };

  public status: Status = new Status("offline");
  public chats: { [key: string]: Chat } = {};
  public user: any = {};

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
