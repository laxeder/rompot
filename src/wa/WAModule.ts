import ICommand from "@interfaces/ICommand";

import Client from "@modules/Client";

import WhatsAppBot from "@wa/WhatsAppBot";

export type WAClient = Client<WhatsAppBot, ICommand>;
