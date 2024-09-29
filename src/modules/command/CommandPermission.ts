import Message from "../../messages/Message";
import { CMDPerms } from "./Command";

export default class CommandPermission {
  /** Identificador da permissão */
  public id: string;
  /** Se tem permissão */
  public isPermited?: boolean;

  constructor(id: string, isPermited: boolean = false) {
    this.id = id;
    this.isPermited = isPermited;
  }

  public static async check(message: Message, cmdPerm: CommandPermission): Promise<boolean> {
    if (cmdPerm.id == CMDPerms.ChatPv) {
      return message.chat.type == "pv";
    }

    if (cmdPerm.id == CMDPerms.ChatGroup) {
      return message.chat.type == "group";
    }

    if (cmdPerm.id == CMDPerms.BotChatLeader) {
      return await message.chat.isLeader(message.botId);
    }

    if (cmdPerm.id == CMDPerms.BotChatAdmin) {
      return await message.chat.isAdmin(message.botId);
    }

    if (cmdPerm.id == CMDPerms.BotChatLeader) {
      return await message.chat.isLeader(message.botId);
    }

    if (cmdPerm.id == CMDPerms.UserChatAdmin) {
      return await message.chat.isAdmin(message.user.id);
    }

    if (cmdPerm.id == CMDPerms.UserChatLeader) {
      return await message.chat.isLeader(message.user.id);
    }

    return true;
  }
}
