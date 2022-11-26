import { DB } from "../types/DB";
export declare class DataBase {
    private _db;
    constructor(DB: DB);
    update(path: string, data: any, options?: any): Promise<[any, any]>;
    set(path: string, data: any, options?: any): Promise<[any, any]>;
    delete(path: string, options?: any): Promise<[any, any]>;
    get(path: string, options?: any): Promise<[any, any]>;
}
