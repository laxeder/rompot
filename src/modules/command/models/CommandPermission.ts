import { CMDPerms, ICommandPermission, IMessage } from "rompot-base";

export default class CommandPermission implements ICommandPermission {
  public id: string;
  public isPermited?: boolean;

  constructor(id: string, isPermited: boolean = false) {
    this.id = id;
    this.isPermited = isPermited;
  }

  public static async check(message: IMessage, cmdPerm: ICommandPermission): Promise<boolean> {
    if (cmdPerm.id == CMDPerms.ChatPv) {
      return message.chat.type == "pv";
    }

    if (cmdPerm.id == CMDPerms.ChatGroup) {
      return message.chat.type == "group";
    }

    if (cmdPerm.id == CMDPerms.BotChatLeader) {
      return await message.chat.isLeader(message.client.id);
    }

    if (cmdPerm.id == CMDPerms.BotChatAdmin) {
      return await message.chat.isAdmin(message.client.id);
    }

    if (cmdPerm.id == CMDPerms.BotChatLeader) {
      return await message.chat.isLeader(message.client.id);
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
