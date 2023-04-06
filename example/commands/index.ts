import { Command } from "../../src";

import { RemoveUserInChatCommand } from "./RemoveUserInChat";
import { AddUserInChatCommand } from "./AddUserInChat";
import { HelloCommand } from "./HelloCommand";
import { ReactCommand } from "./ReactCommand";
import { PollCommand } from "./PollCommand";
import { DateCommand } from "./DateCommand";

export function getCommands(): Command[] {
  const commands = [new HelloCommand(), new DateCommand(), new RemoveUserInChatCommand(), new AddUserInChatCommand(), new PollCommand(), new ReactCommand()];

  return commands;
}
