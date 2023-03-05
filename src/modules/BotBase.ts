import { Client } from "@modules/Client";

import WhatsAppBot from "@wa/WhatsAppBot";

export default function BotBase(): Client {
  return Client(new WhatsAppBot());
}
