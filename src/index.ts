import Client from "./client/Client";

import ConfigWAEvents from "./wa/ConfigWAEvents";
import { MultiFileAuthState } from "./wa/Auth";
import WhatsAppBot from "./wa/WhatsAppBot";

export { MultiFileAuthState, WhatsAppBot, ConfigWAEvents };

export * from "./wa/WAStatus";
export * from "./wa/WAModule";
export * from "./configs/index";
export * from "./messages/index";
// export * from "./command/index";
export * from "./client/index";
export * from "./utils/index";
export * from "./chat/index";
export * from "./user/index";
export * from "./bot/index";

export default Client;
