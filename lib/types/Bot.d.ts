import { Status } from "../models/Status";
export interface BotInterface {
    reconnect: Function;
    getChat: Function;
    getChats: Function;
    connect: Function;
    status: Status;
    stop: Function;
    send: Function;
    user: any;
}
