import { WAPresence } from "../baileys/src/index";

import { ChatStatus } from "../chat/ChatStatus";

export const WAStatus: Record<ChatStatus, WAPresence> = {
  [ChatStatus.Typing]: "composing",
  [ChatStatus.Recording]: "recording",
  [ChatStatus.Online]: "available",
  [ChatStatus.Offline]: "unavailable",
  [ChatStatus.Paused]: "paused",
};
