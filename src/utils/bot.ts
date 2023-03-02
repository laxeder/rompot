import { Bot } from "../types/Bot";


export function setBotProperty(bot: Bot, obj: { bot: Bot }) {
  Object.defineProperty(obj, "bot", {
    get: () => bot,
    set: (value: Bot) => (bot = value),
  });
}
