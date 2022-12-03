import { DB } from "../types/DB";
export declare class BaseDB implements DB {
    constructor();
    update(path: string, data: any, options?: any): Promise<any>;
    set(path: string, data: any, options?: any): Promise<any>;
    get(path: string, options?: any): Promise<any | null>;
    delete(path: string, options?: any): Promise<any>;
}
