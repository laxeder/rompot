import { BotModule } from "../types/BotModule";

export function setBotProperty(obj: { bot: BotModule }, bot: BotModule) {
  Object.defineProperty(obj, "bot", {
    get: () => bot,
    set: (value: BotModule) => (bot = value),
  });
}
