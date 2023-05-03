import { WAPresence } from "baileys";

export const WAStatus: { [s: string]: WAPresence } = {
  typing: "composing",
  recording: "recording",
  online: "available",
  offline: "unavailable",
};
