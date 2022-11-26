import { Subject } from "rxjs";
export interface EventsName {
    connection: string;
    messages: string;
    chats: string;
}
export interface Events {
    messages: Subject<any>;
    connection: Subject<any>;
    chats: Subject<any>;
}
