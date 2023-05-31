/// <reference types="node" />
import { IClient } from "../interfaces/IClient";
export declare const ROMPOT_VERSION = "1.5.2";
/**
 * * Aguarda um determinado tempo
 * @param timeout
 * @returns
 */
export declare function sleep(timeout?: number): Promise<void>;
/**
 * * Obtem a imagem de uma url
 * @param uri URL
 * @returns
 */
export declare function getImageURL(uri: string): Promise<Buffer>;
/**
 * @param err Erro
 * @returns Retorna um erro
 */
export declare function getError(err: any): any;
/**
 * * Remove a Tag do texto
 * @param tag Tag do comando
 * @param text Texto do comando
 * @returns Texto sem a tag
 */
export declare function replaceCommandTag(tag: string, text: string): string;
export declare type ObjectJSON = {
    [key: string]: any | ObjectJSON;
};
/**
 * * Injeta valores de um objeto em outro
 * @param object Objeto com novos valores
 * @param injectableObject Objeto que receberá os novos valores
 * @returns Retorna o objeto com os novos valores
 */
export declare function injectJSON<T extends ObjectJSON>(objectIn: ObjectJSON, objectOut: T): T;
/**
 * * Adiciona um cliente ao objeto
 * @param obj Objeto
 * @param client Cliente
 * @returns Objeto com Cliente adicionado
 */
export declare function ApplyClient<T extends any>(obj: T, client: IClient): T;
export declare function getRompotVersion(): string;
