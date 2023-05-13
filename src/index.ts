import { ConnectionConfig, DefaultConnectionConfig } from "@config/ConnectionConfig";
import { DefaultCommandConfig } from "@config/CommandConfig";

import Client from "@modules/Client";

import { WhatsAppConvertMessage } from "@wa/WAConvertMessage";
import ConfigWAEvents from "@wa/ConfigWAEvents";
import { MultiFileAuthState } from "@wa/Auth";
import WhatsAppBot from "@wa/WhatsAppBot";

export { ConnectionConfig };

export * from "@enums/index";

export * from "@interfaces/index";

export * from "@messages/index";

export * from "@modules/index";

export * from "@utils/index";

export * from "./types";

export { DefaultCommandConfig, DefaultConnectionConfig };

export { MultiFileAuthState, WhatsAppBot, WhatsAppConvertMessage, ConfigWAEvents };
export * from "@wa/WAModules";
export * from "@wa/WAStatus";
export * from "@wa/WAModule";
export * from "@wa/WATypes";

export default Client;
