import { Subject } from "rxjs";
export interface EventsName {
    connection: string;
    message: string;
    chats: string;
    error: string;
    member: string;
}
export interface Events {
    connection: Subject<any>;
    message: Subject<any>;
    member: Subject<any>;
    chats: Subject<any>;
    error: Subject<any>;
}
