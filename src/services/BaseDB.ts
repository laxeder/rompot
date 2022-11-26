import { DB } from "../types/DB";

export class BaseDB implements DB {
  constructor() {}

  public async update(path: string, data: any, options?: any): Promise<any> {}
  public async set(path: string, data: any, options?: any): Promise<any> {}
  public async get(path: string, options?: any): Promise<any | null> {}
  public async delete(path: string, options?: any): Promise<any> {}
}
