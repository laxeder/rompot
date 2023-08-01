import { ICommandControllerConfig, ICommandKey } from "rompot-base";
export default class CommandKey implements ICommandKey {
    type: string;
    values: string[];
    constructor(...values: string[]);
    /**
     * Procura pela chave em um texto
     * @return retorna se a chave foi encontrada
     */
    static search(text: string, config: ICommandControllerConfig, ...keys: ICommandKey[]): ICommandKey | null;
    /** Verifica se o texto contem as chaves */
    static verify(text: string, keys: string[]): boolean;
    /** Verifica se o texto tem as chaves exatas */
    static verifyExact(text: string, keys: string[]): boolean;
}
