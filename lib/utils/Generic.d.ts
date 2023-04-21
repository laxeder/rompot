/// <reference types="node" />
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
