export type AdvancedCommandOptions = {
  removeOnStop: boolean | { age: number };
  attempts: number;
  timeout: number;
  delay: number;
};
