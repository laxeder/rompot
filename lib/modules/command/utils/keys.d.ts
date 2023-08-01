import CommandKey from "../../command/models/CommandKey";
/** Chave do comando exata */
export declare class CommandKeyExact extends CommandKey {
    type: string;
}
/** Chave do comando */
export declare function CMDKey(...values: string[]): CommandKey;
/** Chave exata do comando */
export declare function CMDKeyExact(...values: string[]): CommandKeyExact;
