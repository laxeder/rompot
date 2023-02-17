import { WAPresence } from "@adiwajshing/baileys";

export const WAStatus: { [s: string]: WAPresence } = {
  typing: "composing",
  recording: "recording",
  online: "available",
  offline: "unavailable",
};
