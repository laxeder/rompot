import { DB } from "../types/DB";
export declare class DataBase {
    private _db;
    constructor(DB: DB);
    /**
     * * Atualiza o valor de um caminho do banco de dados
     * @param path
     * @param data
     * @param options
     * @returns
     */
    update(path: string, data: any, options?: any): Promise<[any, any]>;
    /**
     * * Define o valor de um caminho do banco de dados
     * @param path
     * @param data
     * @param options
     * @returns
     */
    set(path: string, data: any, options?: any): Promise<[any, any]>;
    /**
     * * Deleta o valor de um caminho do banco de dados
     * @param path
     * @param options
     * @returns
     */
    delete(path: string, options?: any): Promise<[any, any]>;
    /**
     * * Retorna o valor de um camino do banco de dados
     * @param path
     * @param options
     * @returns
     */
    get(path: string, options?: any): Promise<[any, any]>;
}
