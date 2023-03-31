import Chat from "../modules/Chat";
export declare type Chats = {
    [id: string]: Chat;
};
export declare type ChatType = "community" | "chanel" | "group" | "chat" | "pv";
export declare type ChatStatus = "recording" | "reading" | "offline" | "typing" | "online";
export declare type ChatAction = "add" | "remove";
