import type { AdvancedCommandJob } from "./AdvancedCommandJob";

export type AdvancedCommandTask<T extends object> = (job: AdvancedCommandJob<T>) => Promise<void> | void;
