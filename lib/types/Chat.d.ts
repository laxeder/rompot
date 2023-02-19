import ChatInterface from "../interfaces/ChatInterface";
export declare type ChatType = "community" | "chanel" | "group" | "chat" | "pv";
export declare type ChatStatus = "recording" | "reading" | "offline" | "typing" | "online";
export declare type Chats = {
    [id: string]: ChatInterface;
};
export declare type ChatAction = "add" | "remove";
