import { BotModule } from "../types/Bot";

export function setBotProperty(bot: BotModule, obj: { bot: BotModule }) {
  Object.defineProperty(obj, "bot", {
    get: () => bot,
    set: (value: BotModule) => (bot = value),
  });
}
