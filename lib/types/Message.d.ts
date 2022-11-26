import { Chat } from "../models/Chat";
import { User } from "../models/User";
export interface MessageInterface {
    isNew?: boolean;
    text: string;
    id?: string;
    chat: Chat;
    user: User;
}
