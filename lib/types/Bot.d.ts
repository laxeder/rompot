import { Status } from "../models/Status";
import { Chat } from "../models/Chat";
export interface BotInterface {
    chats: {
        [key: string]: Chat;
    };
    reconnect: Function;
    connect: Function;
    status: Status;
    stop: Function;
    send: Function;
    user: any;
}
