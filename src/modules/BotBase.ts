import ICommand from "@interfaces/ICommand";

import Client, { ClientType } from "@modules/Client";

import WhatsAppBot from "@wa/WhatsAppBot";

export default function BotBase(): ClientType {
  return new Client<WhatsAppBot, ICommand>(new WhatsAppBot());
}
