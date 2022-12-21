interface Chats {
  community: string;
  chanel: string;
  group: string;
  chat: string;
  pv: string;
}

export type ChatTypes = keyof Chats;

var Action: "add" | "remove";
export type ChatAction = typeof Action;
