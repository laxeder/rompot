import { IChat } from "@interfaces/IChat";

export type IChats = { [id: string]: IChat };

export type ChatType = "community" | "chanel" | "group" | "chat" | "pv";

export type ChatStatus = "recording" | "reading" | "offline" | "typing" | "online";

export type ChatAction = "add" | "remove";
