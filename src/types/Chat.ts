import { IChat } from "@interfaces/Chat";

import { ChatModule } from "@modules/Chat";

export type IChats = { [id: string]: IChat };

export type Chats = { [id: string]: ChatModule };

export type ChatType = "community" | "chanel" | "group" | "chat" | "pv";

export type ChatStatus = "recording" | "reading" | "offline" | "typing" | "online";

export type ChatAction = "add" | "remove";
