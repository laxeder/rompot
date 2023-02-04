import ChatInterface from "@interfaces/ChatInterface";

export type ChatType = "community" | "chanel" | "group" | "chat" | "pv";

export type ChatStatus = "recording" | "reading" | "offline" | "typing" | "online";

export type Chats = { [id: string]: ChatInterface };

export type ChatAction = "add" | "remove";
