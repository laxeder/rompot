import { DB } from "../types/DB";
export declare class JsonDB implements DB {
    private _dir;
    private _data;
    constructor(dir: string);
    private save;
    update(path: string, data: any, options?: any): Promise<any>;
    set(path: string, data: any, options?: any): Promise<any>;
    get(path: string, options?: any): Promise<any | null>;
    delete(path: string, options?: any): Promise<any>;
    private getPath;
    private push;
}
