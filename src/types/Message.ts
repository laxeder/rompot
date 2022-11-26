import { Chat } from "@models/Chat";
import { User } from "@models/User";

export interface MessageInterface {
  isOld?: boolean;
  text: string;
  id?: string;
  chat: Chat;
  user: User;
}
