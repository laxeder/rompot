import IChat from "@interfaces/IChat";
export declare type ChatType = "community" | "chanel" | "group" | "chat" | "pv";
export declare type ChatStatus = "recording" | "reading" | "offline" | "typing" | "online";
export declare type Chats = {
    [id: string]: IChat;
};
export declare type ChatAction = "add" | "remove";
