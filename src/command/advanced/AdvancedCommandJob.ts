import type { AdvancedCommandContext } from "./AdvancedCommandContext";
import type { AdvancedCommandNextOptions } from "./AdvancedCommandNext";
import type { AdvancedCommandStopOptions } from "./AdvancedCommandStop";

export type AdvancedCommandJob<T extends object> = {
  context: AdvancedCommandContext<T>;
  saveTaskContext: AdvancedCommandSaveJob<T>;
  nextTask: AdvancedCommandNextJob<T>;
  stopTask: AdvancedCommandStopJob;
};

export type AdvancedCommandSaveJob<T extends object> = (data: T) => Promise<void> | void;

export type AdvancedCommandNextJob<T extends object> = (options?: Partial<AdvancedCommandNextOptions<T>>) => Promise<void> | void;

export type AdvancedCommandStopJob = (options?: Partial<AdvancedCommandStopOptions>) => Promise<void> | void;
