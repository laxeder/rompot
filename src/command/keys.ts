import { CMDKeyType } from "./Command";
import CommandKey from "./CommandKey";

/** Chave do comando exata */
export class CommandKeyExact extends CommandKey {
  public type: string = CMDKeyType.Exact;
}

/** Chave do comando */
export function CMDKey(...values: string[]) {
  return new CommandKey(...values);
}

/** Chave exata do comando */
export function CMDKeyExact(...values: string[]) {
  return new CommandKeyExact(...values);
}
