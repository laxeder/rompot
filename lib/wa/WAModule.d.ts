import ICommand from "@interfaces/ICommand";
import Client from "@modules/Client";
import WhatsAppBot from "@wa/WhatsAppBot";
export declare type WAClient = Client<WhatsAppBot, ICommand>;
