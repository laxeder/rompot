import { IChat } from "@interfaces/Chat";

export type ChatType = "community" | "chanel" | "group" | "chat" | "pv";

export type ChatStatus = "recording" | "reading" | "offline" | "typing" | "online";

export type Chats = { [id: string]: IChat };

export type ChatAction = "add" | "remove";
