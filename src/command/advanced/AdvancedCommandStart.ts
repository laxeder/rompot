import type { AdvancedCommandContext } from "./AdvancedCommandContext";

export type AdvancedCommandStartOptions<T extends object> = {
  chatId: string;
  context: AdvancedCommandContext<T>;
  taskId: string;
};

export type PartialAdvancedCommandStartOptions<T extends object> = {
  chatId: string;
  context?: Partial<AdvancedCommandContext<T>>;
  taskId?: string;
};
