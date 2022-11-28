import { Subject } from "rxjs";

export interface EventsName {
  "bot-message": string;
  connection: string;
  message: string;
  member: string;
  chats: string;
  error: string;
}

export interface Events {
  "bot-message": Subject<any>;
  connection: Subject<any>;
  message: Subject<any>;
  member: Subject<any>;
  chats: Subject<any>;
  error: Subject<any>;
}
