import { handle } from "@utils/handle";
import { DB } from "../types/DB";

export class DataBase {
  private _db: DB;

  constructor(DB: DB) {
    this._db = DB;
  }

  public async update(path: string, data: any, options?: any) {
    return handle(this._db.update(path, data, options));
  }

  public async set(path: string, data: any, options?: any) {
    return handle(this._db.set(path, data, options));
  }

  public async delete(path: string, options?: any) {
    return handle(this._db.delete(path, options));
  }

  public async get(path: string, options?: any) {
    return handle(this._db.get(path, options));
  }
}
