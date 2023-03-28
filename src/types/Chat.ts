import Chat from "@modules/Chat";

export type Chats = { [id: string]: Chat };

export type ChatType = "community" | "chanel" | "group" | "chat" | "pv";

export type ChatStatus = "recording" | "reading" | "offline" | "typing" | "online";

export type ChatAction = "add" | "remove";
