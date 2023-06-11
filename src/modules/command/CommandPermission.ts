import { CMDPerms } from "@enums/Command";

import { ICommandPermission } from "@interfaces/command";
import { IMessage } from "@interfaces/IMessage";

export class CommandPermission implements ICommandPermission {
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
      return await message.chat.IsLeader(message.client.id);
    }

    if (cmdPerm.id == CMDPerms.BotChatAdmin) {
      return await message.chat.IsAdmin(message.client.id);
    }

    if (cmdPerm.id == CMDPerms.BotChatLeader) {
      return await message.chat.IsLeader(message.client.id);
    }

    if (cmdPerm.id == CMDPerms.UserChatAdmin) {
      return await message.chat.IsAdmin(message.user.id);
    }

    if (cmdPerm.id == CMDPerms.UserChatLeader) {
      return await message.chat.IsLeader(message.user.id);
    }

    return true;
  }
}

export function CMDPerm(id: string, isPermited?: boolean) {
  return new CommandPermission(id, isPermited);
}
