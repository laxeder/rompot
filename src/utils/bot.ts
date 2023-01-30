import { BotModule } from "../types/BotModule";

export function setBotProperty(bot: BotModule, obj: { bot: BotModule }) {
  Object.defineProperty(obj, "bot", {
    get: () => bot,
    set: (value: BotModule) => (bot = value),
  });
}
