import type { Message } from "../../messages";

export type AdvancedCommandContext<D extends object> = {
  clientId: string;
  commandId: string;
  taskId: string;
  isRun: boolean;
  attemptsMade: number;
  message: Message;
  chatId: string;
} & D;
