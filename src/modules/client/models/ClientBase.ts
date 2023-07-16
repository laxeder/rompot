import { BotBase } from "../../bot/models/BotBase";
import Client from "./Client";

export default function ClientBase() {
  return new Client<BotBase>(new BotBase());
}
