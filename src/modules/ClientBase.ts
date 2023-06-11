import { BotBase } from "./Base";
import Client from "./Client";

export function ClientBase() {
  return new Client<BotBase>(new BotBase());
}
