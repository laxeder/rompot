import { Auth } from "@wa/Auth";

export default interface ConnectionConfig {
  disableAutoCommand?: boolean;
  autoRunBotCommand?: boolean;
  receiveAllMessages?: boolean;
  printQRInTerminal?: boolean;
  disableAutoRead?: boolean;
  disableAutoTyping?: boolean;
  auth: string | Auth;
}
